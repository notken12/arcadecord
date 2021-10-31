const express = require('express');
const request = require('request');
const app = express();
const port = 3000;

const bot = require('./bot/main.js');
const dotenv = require('dotenv');
const gamesManager = require('./games/gamesManager.js');
const cookieParser = require('cookie-parser');

dotenv.config();

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
  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    res.cookie('user', JSON.parse(body).refresh_token, { httpOnly: true });

    var cookie = req.cookies.gameId;
    if (cookie === undefined) {
      res.send('logged in');
    } else {
      res.redirect('/game/' + cookie);
    }
  });
});

app.use('/game', (req, res) => {
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
      //if user is signed in, send game page
      //if user is not signed in, redirect to sign in page
      res.send(cookie);
    }
  } else {
    //game does not exist
    //send  404 page
    res.sendFile(__dirname + '/html/game-not-found.html');
  }

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});