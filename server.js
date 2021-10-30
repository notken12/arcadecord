const express = require('express');
const request = require('request');
const app = express();
const port = 3000;

const bot = require('./bot.js');
const dotenv = require('dotenv');

dotenv.config();

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
  const code = req.query.code
  const options = {
    method: 'POST',
    uri: 'https://discord.com/api/oauth2/token',
    form: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.REDIRECT_URI
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  //send post request
  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    res.send(body);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});