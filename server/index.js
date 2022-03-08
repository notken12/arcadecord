// index.js - Arcadecord
// 
// Copyright (C) 2022 Ken Zhou 
// 
// This file is part of Arcadecord. 
// 
// Arcadecord can not be copied and/or distributed 
// without the express permission of Ken Zhou.

let start = Date.now();

import dotenv from 'dotenv';
dotenv.config({
  'path': './server/.env'
});

import bases from 'bases';

import express from 'express';
const app = express();

// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

import { createServer } from 'http';
const server = createServer(app);
import { Server } from "socket.io";
import { parse } from 'cookie';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import cors from 'cors';
import JWT from 'jsonwebtoken';
import shrinkRay from 'shrink-ray-current';

import db from '../db/db2.js';

import { fetchUser, fetchUserFromAccessToken } from './utils/discord-api.js';
import { gameTypes } from './src/games/game-types.js';
import Action from './src/games/Action.js';
import Turn from './src/games/Turn.js';

import appInsights from 'applicationinsights';

appInsights.setup(process.env.APPINSIGHTS_CONNECTIONSTRING)
  .setSendLiveMetrics(true);

const appInsightsClient = appInsights.defaultClient;

appInsights.start();

// get __dirname
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

// Connect to database
db.connect();

// get architecture from config
import architecture from './config/architecture.js';

const { hosts } = architecture;

// get the current host info
const hostId = process.argv[2];
const host = hosts.find(host => host.id === hostId);

var port;

if (process.env.NODE_ENV === 'production' && process.env.HOSTED_ON === 'heroku') {
  port = process.env.PORT;
} else {
  port = host.port;
}

// Create snowflake generator
import { Generator } from 'snowflake-generator';
const SnowflakeGenerator = new Generator(946684800000, hosts.indexOf(host));

app.use(cors());

app.use(shrinkRay());

// Health check
app.head('/health', function (req, res) {
  res.sendStatus(200);
});

// app.use('/public', express.static(path.resolve('build/server/public')));
// app.use('/dist', express.static(path.resolve('build/server/dist')));

// Check the name of the host
app.get('/name', function (req, res) {
  res.send(host.name);
});

//console.log(vite.middlewares.stack[5].handle.toString());

async function useBuiltFile(pathName, req, res) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // Dev mode, use Vite dev server
      const url = req.originalUrl
      // 1. Read html file
      let template = fs.readFileSync(
        path.resolve(__dirname, pathName),
        'utf-8'
      );

      // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
      //    also applies HTML transforms from Vite plugins, e.g. global preambles
      //    from @vitejs/plugin-react
      template = await viteDevServer.transformIndexHtml(url, template)

      // 6. Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    } else {
      // Production, use static built files
      var prefix = path.resolve(__dirname, './src');
      var filePath = path.resolve(__dirname, pathName)
        .replace(path.resolve(prefix, './public'), `${__dirname}/dist`)
        .replace(prefix, `${__dirname}/src/dist`);
      res.sendFile(filePath);
    }
  }
  catch (err) {
    // Send internal server error
    console.error(err);
    res.status(500).end('Internal server error')

  }

}

// Example: Express
// On request, build each file on request and respond with its built contents
/*app.use(async (req, res, next) => {
  try {
    var proxyResult = await proxySnowpackDev(req.url, res);
    if (!proxyResult) {
      next();
    }
  } catch (err) {
    next();
  }
});*/

server.listen(port, () => {
  let duration = Date.now() - start;
  appInsights.defaultClient.trackMetric({ name: "Server startup time", value: duration });
  console.log(`Server host ${hostId} listening at port ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "arcadecord.herokuapp.com"],
  }
});

// Use redis adapter to communicate socket data with other hosts
// import redis from 'socket.io-redis';
// io.adapter(redis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }));

import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient = createClient({ url: process.env.REDIS_URL, password: process.env.REDIS_PASSWORD });
pubClient.on('error', (err) => {
  console.error(`Error in redis client: ${err}`);
})
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));

});


io.on('connection', (socket) => {
  appInsightsClient.trackEvent({ name: 'Socket opened' });
  //console.log('a user connected');

  socket.on('connect_socket', async function (data, callback) {
    const cookies = parse(socket.request.headers.cookie || "");

    let cookie = cookies.accessToken;

    let tokenUserId;
    let token;
    try {
      token = JWT.verify(cookie, process.env.JWT_SECRET);
      tokenUserId = token.id;
    } catch (e) {
      //user is not signed in. or has an invalid access token
      //set cookie for game id to redirect back to
      //redirect to sign in page
      callback({
        error: "Invalid access token"
      });
      appInsightsClient.trackEvent({ name: 'Socket connection error', properties: { error: 'Invalid access token' } });
      return;
    }

    var user = await db.users.getById(tokenUserId);
    if (!user) {
      callback({
        error: "Invalid access token"
      });

      appInsightsClient.trackEvent({ name: 'Socket connection error', properties: { error: 'Invalid access token' } });
      return;
    }

    const userId = user._id;
    const gameId = data.gameId;

    if (!userId) {
      callback({
        error: "Invalid user id"
      });

      appInsightsClient.trackEvent({ name: 'Socket connection error', properties: { error: 'Invalid user id' } });
      return;
    };

    if (gameId) {
      var dbGame = await db.games.getById(gameId);

      if (dbGame) {
        // get game type
        var gameType = gameTypes[dbGame._doc.typeId]

        // create instance of game
        var game = new gameType.Game(dbGame._doc);

        if (await game.canUserSocketConnect(userId)) {
          // Disconnect socket from other tab
          let oldSocket = game.getSocket(userId);
          io.to(oldSocket).disconnectSockets(true);

          // Disconnect reasons: 
          // https://socket.io/docs/v4/client-api/#event-disconnect

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
            discordUser: await fetchUser(userId)
          });

          appInsightsClient.trackEvent({ name: 'Socket connection', properties: { gameId: gameId, userId: userId } });
        } else {
          // For some reason user isn't allowed to join (isn't in same server, game full, etc)
          callback({
            status: 'error',
            error: `No permission to join game (isn't in same server, game full, etc)`
          });
        }
      } else {
        callback({
          status: 'error',
          error: 'Game not found',
        });
      }
    } else {
      callback({
        status: 'error',
        error: 'Game not found',
      });
    }
  });

  socket.on('action', async (type, data, callback) => {
    try {
      // get which game the socket is in
      var gameId = socket.data.gameId;
      var userId = socket.data.userId;

      if (gameId === undefined || userId === undefined || gameId === null || userId === null) {
        console.log('Socket action error: gameId or userId is undefined');
        callback({
          error: "Invalid game or user"
        });

        appInsightsClient.trackEvent({ name: 'Socket action error', properties: { error: 'Invalid game or user' } });
        return;
      }

      // Lock actions for this game to prevent multiple actions from being executed at the same time
      //lock(gameId, async function (release) {

      // get game from db
      var dbGame = await db.games.getById(gameId);

      if (!dbGame)
        return;

      // get game type
      var gameType = gameTypes[dbGame._doc.typeId]

      // create instance of game
      var game = new gameType.Game(dbGame._doc);

      var oldTurn = game.turn + 0;

      // perform action
      var action = new Action(type, data, userId);
      var result = await game.handleAction(action);

      if (!result) {
        callback({
          error: "Invalid action"
        });
        return
      }

      // save game to db
      await db.games.update(gameId, game);

      // send result to client
      await callback(result);

      if (game.turn !== oldTurn) {
        console.log(`Game ${game.id} turn`);

        var player = game.players[game.turn];
        //console.log(`Player ${player.id}`);
        var s = game.sockets[player.id];
        //console.log(`Socket ${s}`);

        // send turn to next user
        if (s) {
          var gameData = game.getDataForClient(player.id);
          var turnData = Turn.getDataForClient(game.turns[game.turns.length - 1], player.id);
          await io.to(s).emit('turn', gameData, turnData);
        }
      }

      appInsightsClient.trackEvent({ name: 'Action', properties: { gameId: gameId, userId: userId, type: type, result: result, id: action.id } });

      // release lock
      /*release(function (err) {
        if (err) {
          console.error(err);
        }
      })();*/
      //});
    }
    catch (e) {
      console.error(e);

      appInsightsClient.trackEvent({ name: 'Action error', properties: { gameId: gameId, userId: userId, type: type, result: result, id: action.id, action: action } });

      callback({
        error: "Error handling action"
      });
    }
  });

  socket.on('resend invite', async () => {
    try {
      // get which game the socket is in
      var gameId = socket.data.gameId;
      var userId = socket.data.userId;

      if (gameId === undefined || userId === undefined || gameId === null || userId === null) {
        console.log('Socket action error: gameId or userId is undefined');
        callback({
          error: "Invalid game or user"
        });

        appInsightsClient.trackEvent({ name: 'Socket resend invite error', properties: { error: 'Invalid game or user' } });
        return;
      }

      // get game from db
      var dbGame = await db.games.getById(gameId);

      if (!dbGame)
        return;

      // get game type
      var gameType = gameTypes[dbGame._doc.typeId]

      // create instance of game
      var game = new gameType.Game(dbGame._doc);

      // trigger turn event handler to resend invite
      await game.emit('turn');

      // save game to db
      await db.games.update(gameId, game);

      // send result to client
      await callback({ status: 'success' });

      appInsightsClient.trackEvent({ name: 'Resend game invite', properties: { gameId: gameId, userId: userId } });

      // release lock
      /*release(function (err) {
        if (err) {
          console.error(err);
        }
      })();*/
      //});
    }
    catch (e) {
      console.error(e);

      appInsightsClient.trackEvent({ name: 'Resend game invite error', properties: { gameId: gameId, userId: userId, error: e } });

      callback({
        status: 'error'
      });
    }
  });

});

// Track all HTTP requests with Application Insights
app.use(function (req, res, next) {
  appInsightsClient.trackNodeHttpRequest({ request: req, response: res });
  next();
});

/*app.get('/vite/:url', (req, res) => {
  console.log(req.params.url);
  proxyViteDev(req.params.url, res);
})*/

// Use controllers to handle requests
import authController from './controllers/auth.controller.js';

app.get('/discord-oauth', (req, res) => {
  res.redirect('https://discord.com/api/oauth2/authorize?client_id=903801669194772531&redirect_uri=' + encodeURIComponent(process.env.GAME_SERVER_URL + '/auth') + '&response_type=code&scope=identify');
});

//get authorization code
app.get('/auth', authController);

app.post('/create-game', async (req, res) => {
  try {
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

    // Set game ID
    var snowflake = SnowflakeGenerator.generate();
    var snowflakeNum = Number(snowflake);
    game.id = bases.toBase62(snowflakeNum);

    // add player to game
    var user = await db.users.getById(req.body.userId);
    await game.addPlayer(user._id);
    await game.init();

    // add game to database
    await db.games.create(game);

    res.json(game);
  }
  catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
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

import { createPageRenderer } from 'vite-plugin-ssr'

var viteDevServer;
const isProduction = process.env.NODE_ENV === 'production';
// const root = `${path.dirname(import.meta.url)}/src`;
const root = `${__dirname}/src`;

if (!isProduction) {
  // IF DEVELOPMENT

  // Create Vite server in middleware mode. This disables Vite's own HTML
  // serving logic and let the parent server take control.
  //
  // In middleware mode, if you want to use Vite's own HTML serving logic
  // use `'html'` as the `middlewareMode` (ref https://vitejs.dev/config/#server-middlewaremode)
  let { createServer: createViteServer } = await import('vite');

  viteDevServer = await createViteServer({
    server: { middlewareMode: 'ssr' }
  });
  // use vite's connect instance as middleware
  app.use(viteDevServer.middlewares);
} else {
  // IF PRODUCTION
  app.use('/dist', express.static(path.resolve(__dirname, 'src/dist/client')));
}

const renderPage = createPageRenderer({ viteDevServer, isProduction, root, outDir: 'dist', baseAssets: '/dist/' })

app.get('/game/:gameId', async (req, res, next) => {
  res.cookie('gameId', req.params.gameId, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
  next();
})

app.get('*', async (req, res, next) => {
  const url = req.originalUrl
  console.log(url)

  let cookie = req.cookies.accessToken;

  //check database if user is signed in
  let userId;
  let token;
  try {
    token = JWT.verify(cookie, process.env.JWT_SECRET);
    userId = token.id;
  } catch (e) {
    userId = null;
  }

  const pageContextInit = {
    url,
    userId,
  }
  const pageContext = await renderPage(pageContextInit)
  const { httpResponse } = pageContext
  if (!httpResponse) return next()
  const { body, statusCode, contentType } = httpResponse
  res.status(statusCode).type(contentType).send(body)
})

export const handler = app;