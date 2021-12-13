const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const request = require('request');
const app = express();
const port = process.env.PORT || 3000;

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cookie = require('cookie');
const cookieParser = require('cookie-parser');

const db = require('../db/db2');

const discordApiUtils = require('./utils/discord-api');
const gameTypes = require('./games/game-types');
const gamesManager = require('./games/gamesManager');
const Action = require('./games/Action');
const Turn = require('./games/Turn');

const BotApi = require('./bot/api');

db.connect();

const io = new Server(server);

io.on('connection', (socket) => {
  //console.log('a user connected');

  socket.on('connect_socket', async function (data, callback) {
    const cookies = cookie.parse(socket.request.headers.cookie || "");

    var token = cookies.accessToken;

    var user = await db.users.getByAccessToken(token);
    if (!user) {
      callback({
        error: "Invalid access token"
      });
      return;
    }

    const userId = user._id;
    const gameId = data.gameId;

    if (!userId) return;

    if (gameId) {
      var dbGame = await db.games.getById(gameId);

      if (dbGame) {
        // get game type
        var gameType = gameTypes[dbGame._doc.typeId]

        // create instance of game
        var game = new gameType.Game(dbGame._doc);

        if (await game.canUserSocketConnect(userId)) {
          // TODO: disconnect old socket if the user already connected to the same game

          // set socket info
          socket.data.userId = userId;
          socket.data.gameId = gameId;

          game.setSocket(userId, socket.id);

          // add socket to game room for broadcasting events
          socket.join('game/' + gameId);

          // save game to db
          await db.games.update(gameId, game);

          // send game info to user
          callback({
            status: 'success',
            game: game.getDataForClient(userId),
            discordUser: await discordApiUtils.fetchUser(userId)
          });
        }
      }
    }
  });

  socket.on('action', async function (type, data, callback) {
    // get which game the socket is in
    var gameId = socket.data.gameId;
    var userId = socket.data.userId;

    // get game from db
    var dbGame = await db.games.getById(gameId);

    if (dbGame) {
      // get game type
      var gameType = gameTypes[dbGame._doc.typeId]

      // create instance of game
      var game = new gameType.Game(dbGame._doc);

      // listen for game flow events so that turns can be broadcasted
      game.on('turn', function (game) {
        console.log(`Game ${game.id} turn`);

        var player = game.players[game.turn];
        var socket = game.sockets[player.id];

        // send turn to next user
        if (socket) {
          var gameData = game.getDataForClient(player.id);
          var turnData = Turn.getDataForClient(game.turns[game.turns.length - 1], player.id);
          io.to(socket).emit('turn', gameData, turnData);
        }
      });

      // perform action
      var action = new Action(type, userId, data, game);
      var result = await game.handleAction(action);

      // save game to db
      await db.games.update(gameId, game);

      // send result to client
      callback(result);
    }
  });

});

// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser());

app.use(express.json());

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

app.get('/discord-oauth', (req, res) => {
  res.redirect('https://discord.com/api/oauth2/authorize?client_id=903801669194772531&redirect_uri=' + encodeURIComponent(process.env.GAME_SERVER_URL + '/auth') + '&response_type=code&scope=identify');
});

//get authorization code
app.get('/auth', (req, res) => {
  const code = req.query.code;

  const options = {
    method: 'POST',
    uri: 'https://discord.com/api/oauth2/token',
    form: {
      client_id: process.env.BOT_CLIENT_ID,
      client_secret: process.env.BOT_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.GAME_SERVER_URL + '/auth'
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  console.log(options);

  //send post request
  request(options, async (error, response, body) => {
    if (error) {
      console.log(error);
      res.send('Error');
    };


    var data = JSON.parse(body);

    console.log(data);

    var refresh_token = data.refresh_token;
    var access_token = data.access_token;

    // error here, replace with bot IPC api call
    var user = await discordApiUtils.fetchUserFromAccessToken(access_token);
    if (!user) {
      res.send('Error: could not get user from access token');
      return;
    }

    var dId = user.id;

    //create user in db

    // check if user exists

    var userFromDiscord = await db.users.getByDiscordId(dId);

    var existingUserId;
    if (userFromDiscord) {
      existingUserId = userFromDiscord._id;
    }
    if (!existingUserId) {
      // new user
      var id = (await db.users.create(
        {
          discordId: dId,
          discordRefreshToken: refresh_token,
          discordAccessToken: access_token
        }
      ))._id;
      var token = await db.users.generateAccessToken(id);
      res.cookie('accessToken', token, { httpOnly: true });
    }
    else {
      // existing user
      db.users.update(existingUserId, {
        discordId: dId,
        discordRefreshToken: refresh_token,
        discordAccessToken: access_token
      });
      var token = await db.users.generateAccessToken(existingUserId);
      res.cookie('accessToken', token, { httpOnly: true });
    }

    var cookie = req.cookies.gameId;
    if (cookie === undefined) {
      res.send('logged in from sign in page, no game to redirect to');
    } else {
      res.redirect('/game/' + cookie);
    }
  });
});

app.use('/gamecommons', async (req, res) => {
  var id = req.path.split('/')[1];

  res.sendFile(__dirname + '/games/types/' + id + '/common.js');
});

app.use('/gameassets', async (req, res) => {
  var path = req.path.split('/');
  path.shift();

  var id = path[0];

  path.shift();
  res.sendFile(__dirname + '/games/types/' + id + '/assets/' + path.join('/'));
});

//user is accessing game
app.get('/game/:id', async (req, res) => {
  var id = req.params.id;

  var dbGame = await db.games.getById(id);

  if (dbGame) {
    // get game type
    var gameType = gameTypes[dbGame.typeId];

    // create instance of game, var game
    var game = new gameType.Game(dbGame._doc);

    var cookie = req.cookies.accessToken;

    //check database if user is signed in
    var user = await db.users.getByAccessToken(cookie);

    if (user) {
      //user is signed in. 
      //redirect to game

      var userId = user._id;


      var status = await game.doesUserHavePermission(userId);
      res.clearCookie('gameId', { httpOnly: true });

      if (status) {
        //user has permission to join
        res.sendFile(__dirname + '/games/types/' + game.typeId + '/index.html');
      } else {
        res.send('you have no permission to join');
      }

    } else {
      //user is not signed in. or has an invalid access token
      //set cookie for game id to redirect back to
      //redirect to sign in page
      res.cookie('gameId', id, { maxAge: 900000, httpOnly: true });
      console.log('cookie created successfully');
      res.redirect('/sign-in');
    }
  } else {
    //game does not exist
    //send  404 page
    res.sendFile(__dirname + '/html/game-not-found.html');
  }

});

app.post('/create-game', async (req, res) => {
  // get token from headers
  var authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send('Access denied. No token provided.');
    return;
  }
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).send('Access denied. Invalid token.');
    return;
  }
  // Remove Bearer from string
  var token = authHeader.slice(7, authHeader.length);

  if (token !== process.env.GAME_SERVER_TOKEN) {
    res.status(401).send('Access denied. Invalid token.');
    return;
  }

  // get game options
  var options = req.body.options;
  var typeId = options.typeId;

  // get game constructor
  var Game = gameTypes[typeId].Game;

  var game = new Game(options);

  // add player to game
  var user = await db.users.getById(req.body.userId);
  await game.addPlayer(user._id);
  await game.init();

  // add game to database
  await db.games.create(game);

  res.json(game);
});

app.get('/discord-oauth2-sign-in', (req, res) => {
  res.redirect('https://discord.com/api/oauth2/authorize?client_id=' + process.env.BOT_CLIENT_ID + '&redirect_uri=' +
    encodeURIComponent(process.env.GAME_SERVER_URL + '/auth') +
    '&response_type=code&scope=identify%20email%20connections');
});

app.get('/discord-oauth2-invite-bot', (req, res) => {
  res.redirect('https://discord.com/api/oauth2/authorize?client_id=' + process.env.BOT_CLIENT_ID + '&redirect_uri=' +
    encodeURIComponent(process.env.GAME_SERVER_URL + '/auth') +
    '&response_type=code&scope=bot%20applications.commands%20identify%20email%20rpc%20rpc.activities.write');
});

server.listen(port || 3000, () => {
  console.log(`App listening at port ${port || 3000}`)
});