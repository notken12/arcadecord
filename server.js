const express = require('express');
const request = require('request');
const app = express();
const port = 3000;

const bot = require('./bot/bot.js');
const dotenv = require('dotenv');
const gamesManager = require('./games/gamesManager.js');
const cookieParser = require('cookie-parser');
const db = require('./db/db');
const discordApiUtils = require('./utils/discord-api');

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cookie = require('cookie');
const { user } = require('./bot/bot.js');

dotenv.config();

const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('connect_socket', async function (data, callback) {
    const cookies = cookie.parse(socket.request.headers.cookie || "");

    const userId = cookies.user;
    const gameId = data.gameId;

    if (!userId) return;

    if (gameId) {
      var game = gamesManager.getGame(gameId);
      if (game) {
        if (await game.canUserSocketConnect(userId)) {
          socket.data.userId = userId;

          game.setSocket(userId, socket);

          callback({
            status: 'success',
            game: game.getDataForClient(userId)
          });
        }
      }
    }
  });
});

// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.use('/public', express.static(__dirname + '/public'));

app.get('/sign-in', (req, res) => {
  res.sendFile(__dirname + '/html/sign-in.html')
});

app.get('/invite', (req, res) => {
  res.sendFile(__dirname + '/html/invite.html')
});

//get authorization code
app.get('/auth', (req, res) => {
  const code = req.query.code;

  const options = {
    method: 'POST',
    uri: 'https://discord.com/api/oauth2/token',
    form: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.BASE_URL + '/auth'
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  //send post request
  request(options, async (error, response, body) => {
    if (error) throw new Error(error);

    var refresh_token = JSON.parse(body).refresh_token;
    var access_token = JSON.parse(body).access_token;

    var dId = (await discordApiUtils.fetchUserFromAccessToken(access_token)).id;

    //create user in db

    var existingUserId = await db.getUserFromDiscordId(dId);
    if (!existingUserId) {
      // new user
      var id = (await db.createUser(refresh_token, access_token, dId)).get('id');
      res.cookie('user', id, { httpOnly: true });
    }
    else {
      // existing user
      db.updateUser(existingUserId, refresh_token, access_token, dId);
      res.cookie('user', existingUserId, { httpOnly: true });
    }

    var cookie = req.cookies.gameId;
    if (cookie === undefined) {
      res.send('logged in from sign in page, no game to redirect to');
    } else {
      res.redirect('/game/' + cookie);
    }
  });
});

//user is accessing game
app.use('/game', async (req, res) => {
  var id = req.path.substring(1, req.path.length);
  var game = gamesManager.getGame(id);

  if (game) {
    var cookie = req.cookies.user;
    if (cookie === undefined) {
      //user is not signed in. 
      //set cookie for game id to redirect back to
      //redirect to sign in page
      res.cookie('gameId', id, { maxAge: 900000, httpOnly: true });
      console.log('cookie created successfully');
      res.redirect('/sign-in');
    } else {
      //cookie exists. 
      //check database if user is signed in
      var user = await db.getUser(cookie);
      if (user) {
        //user is signed in. 
        //redirect to game


        var status = await game.doesUserHavePermission(cookie);
        res.clearCookie('gameId', { httpOnly: true });

        if (status) {
          //user has permission to join
          res.sendFile(__dirname + '/html/games/' + game.typeId + '.html');
        } else {
          res.send('you have no permission to join');
        }

      } else {
        //user is not signed in. 
        //set cookie for game id to redirect back to
        //redirect to sign in page
        res.cookie('gameId', id, { maxAge: 900000, httpOnly: true });
        console.log('cookie created successfully');
        res.redirect('/sign-in');
      }
    }
  } else {
    //game does not exist
    //send  404 page
    res.sendFile(__dirname + '/html/game-not-found.html');
  }

});

server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});