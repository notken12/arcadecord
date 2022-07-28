// index.ts - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

let start = Date.now();

import { config } from 'dotenv';
config();

// Get host configuration
import { loadHostConfig } from './config.js';
const host = loadHostConfig();

import express from 'express';
const app = express();
app.enable('trust proxy');
app.set('port', host.port || 3000);

import shrinkRay from 'shrink-ray-current';
// Compress all requests
app.use(shrinkRay());

// need cookieParser middleware before we can do anything with cookies
import cookieParser from 'cookie-parser';
app.use(cookieParser());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

import { createServer } from 'http';
const server = createServer(app);
import { Server } from 'socket.io';
import cors from 'cors';
import JWT from 'jsonwebtoken';

import db from '../db/db2.js';

import { fetchUser } from './utils/discord-api.js';
import { gameTypes } from './src/games/game-types.js';
import Action from './src/games/Action.js';
import Turn from './src/games/Turn.js';

import * as appInsights from 'applicationinsights';

appInsights
  .setup(process.env.APPINSIGHTS_CONNECTIONSTRING)
  .setSendLiveMetrics(true);

const appInsightsClient = appInsights.defaultClient;

appInsights.start();

// get __dirname
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

// Connect to database
await db.connect(process.env.MONGODB_URI);

app.use(
  cors({
    origin: host.webServerUrl,
  })
);

// Health check
app.head('/health', function (_req, res) {
  res.sendStatus(200);
});

// Check the name of the host
app.get('/name', function (_req, res) {
  res.send(host.id);
});

app.get('/discord-invite', (_req, res) => {
  res.redirect(host.discordServerInvite);
});

// Track all HTTP requests with Application Insights
app.use(function (req, res, next) {
  appInsightsClient.trackNodeHttpRequest({ request: req, response: res });
  next();
});

app.get('/discord-oauth', (_req, res) => {
  res.redirect(
    'https://discord.com/api/oauth2/authorize?client_id=903801669194772531&redirect_uri=' +
      encodeURIComponent(host.gameServerUrl + '/auth') +
      '&response_type=code&scope=identify'
  );
});

// Use controllers to handle requests
import authController from './controllers/auth.controller.js';
import signOutController from './controllers/sign-out.controller.js';

//get authorization code
app.get('/auth', async (req, res, next) => {
  const result = await authController(req, res, next);
  if (result != null) {
    appInsightsClient.trackEvent({
      name: 'User logged in',
      properties: result,
    });
  }
});

import signInController from './controllers/sign-in.controller.js';
app.get('/sign-in', signInController);

app.get('/invite', (_req, res) => {
  res.redirect(
    'https://discord.com/api/oauth2/authorize?client_id=' +
      host.botClientId +
      '&redirect_uri=' +
      encodeURIComponent(host.gameServerUrl + '/auth') +
      '&response_type=code&scope=bot%20applications.commands%20identify'
  );
});

app.get('/sign-out', signOutController);

app.get('/ko-fi', (_req, res) => {
  res.redirect('https://ko-fi.com/arcadecord');
});

app.get('/top-gg', (_req, res) => {
  res.redirect(host.topGgUrl);
});

const io = new Server(server, {
  cors: {
    origin: [host.webServerUrl],
    // origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  allowEIO3: true,
});

// Use redis adapter to communicate socket data with other hosts
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

const pubClient = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});
pubClient.on('error', (err) => {
  console.error(`Error in redis client: ${err}`);
});
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});

io.on('connection', (socket) => {
  appInsightsClient.trackEvent({ name: 'Socket opened' });

  socket.on('connect_socket', async function (data, callback) {
    let cookie = data.accessToken;

    let tokenUserId;
    let token;
    try {
      token = JWT.verify(
        cookie,
        process.env.JWT_SECRET as JWT.Secret
      ) as JWT.JwtPayload;
      tokenUserId = token.id;
    } catch (e) {
      //user is not signed in. or has an invalid access token
      //set cookie for game id to redirect back to
      //redirect to sign in page
      callback({
        error: 'Invalid access token',
      });
      appInsightsClient.trackEvent({
        name: 'Socket connection error',
        properties: { error: 'Invalid access token' },
      });
      return;
    }

    var user = await db.users.getById(tokenUserId);
    if (!user) {
      callback({
        error: 'Invalid access token',
      });

      appInsightsClient.trackEvent({
        name: 'Socket connection error',
        properties: { error: 'Invalid access token' },
      });
      return;
    }

    const userId = user._id;
    const gameId = data.gameId;

    if (!userId) {
      callback({
        error: 'Invalid user id',
      });

      appInsightsClient.trackEvent({
        name: 'Socket connection error',
        properties: { error: 'Invalid user id' },
      });
      return;
    }

    if (gameId) {
      var dbGame = await db.games.getById(gameId);

      if (dbGame) {
        // get game type
        var gameType = gameTypes[dbGame._doc.typeId];

        // create instance of game
        var game = new gameType.Game(dbGame._doc);

        if ((await game.canUserSocketConnect(userId)).ok) {
          // Disconnect socket from other tab
          let oldSocket = game.getSocket(userId);
          if (oldSocket != null) {
            io.to(oldSocket).disconnectSockets(true);
          }

          // Disconnect reasons:
          // https://socket.io/docs/v4/client-api/#event-disconnect

          // set socket info
          socket.data.userId = userId;
          socket.data.gameId = gameId;

          // add socket to game room for broadcasting events
          socket.join('game/' + gameId);

          game.setSocket(userId, socket.id);

          // save game to db
          await db.games.update(gameId, game);

          // Expose all user data except for refresh and access token
          let { settings, _id, discordId, joined } = user._doc;

          // send game info to user
          callback({
            status: 'success',
            game: game.getDataForClient(userId),
            discordUser: await fetchUser(userId),
            user: {
              settings,
              _id,
              discordId,
              joined,
            },
            contested: game.isConnectionContested(userId),
          });

          appInsightsClient.trackEvent({
            name: 'Socket connection',
            properties: { gameId: gameId, userId: userId },
          });
        } else {
          // For some reason user isn't allowed to join (isn't in same server, game full, etc)
          callback({
            status: 'error',
            error: `No permission to join game (isn't in same server, game full, etc)`,
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
    let action;
    try {
      // get which game the socket is in
      var gameId = socket.data.gameId;
      var userId = socket.data.userId;

      if (
        gameId === undefined ||
        userId === undefined ||
        gameId === null ||
        userId === null
      ) {
        console.log('Socket action error: gameId or userId is undefined');
        callback({
          error: 'Invalid game or user',
        });

        appInsightsClient.trackEvent({
          name: 'Socket action error',
          properties: { error: 'Invalid game or user' },
        });
        return;
      }

      // get game from db
      var dbGame = await db.games.getById(gameId);

      if (!dbGame) return;

      // get game type
      var gameType = gameTypes[dbGame._doc.typeId];

      // create instance of game
      var game = new gameType.Game(dbGame._doc);

      var oldTurn = game.turn + 0;

      // perform action
      action = new Action(type, data, userId);
      var result = await game.handleAction(action);

      if (!result.success) {
        callback({
          error: 'Invalid action',
        });
        return;
      }

      // save game to db
      await db.games.update(gameId, game);

      // send result to client
      await callback(result);

      if (game.turn !== oldTurn) {
        var player = game.players[game.turn];
        //console.log(`Player ${player.id}`);
        var s = game.sockets[player.id];
        //console.log(`Socket ${s}`);

        // send turn to next user
        if (s) {
          var gameData = game.getDataForClient(player.id);
          var turnData = game.turns[game.turns.length - 1];
          io.to(s).emit('turn', gameData, turnData);
        }
      }

      appInsightsClient.trackEvent({
        name: 'Action',
        properties: {
          gameId: gameId,
          userId: userId,
          type: type,
          result: result,
          id: action.id,
        },
      });
    } catch (e) {
      console.log('Error handling action');
      console.error(e);

      appInsightsClient.trackEvent({
        name: 'Action error',
        properties: {
          gameId: gameId,
          userId: userId,
          type: type,
          id: action?.id,
          action: action,
        },
      });

      callback({
        error: 'Error handling action',
      });
    }
  });

  socket.on('resend invite', async (callback) => {
    try {
      // get which game the socket is in
      var gameId = socket.data.gameId;
      var userId = socket.data.userId;

      if (
        gameId === undefined ||
        userId === undefined ||
        gameId === null ||
        userId === null
      ) {
        console.log(
          'Socket resend invite error: gameId or userId is undefined'
        );
        callback({
          error: 'Invalid game or user',
        });

        appInsightsClient.trackEvent({
          name: 'Socket resend invite error',
          properties: { error: 'Invalid game or user' },
        });
        return;
      }

      // get game from db
      var dbGame = await db.games.getById(gameId);

      if (!dbGame) return;

      // get game type
      var gameType = gameTypes[dbGame._doc.typeId];

      // create instance of game
      var game = new gameType.Game(dbGame._doc);

      game.resending = true;
      // trigger turn event handler to resend invite
      await game.emit('turn');

      // save game to db
      await db.games.update(gameId, game);

      // send result to client
      await callback({ status: 'success' });

      appInsightsClient.trackEvent({
        name: 'Resend game invite',
        properties: { gameId: gameId, userId: userId },
      });
    } catch (e) {
      console.error(e);

      appInsightsClient.trackEvent({
        name: 'Resend game invite error',
        properties: { gameId: gameId, userId: userId, error: e },
      });

      callback({
        status: 'error',
      });
    }
  });

  socket.on('settings:update', async (newSettings, callback) => {
    try {
      // get which game the socket is in
      var userId = socket.data.userId;

      if (userId === undefined || userId === null) {
        console.log('Socket update user settings error: userId is missing');
        callback({
          error: 'Invalid user',
        });

        appInsightsClient.trackEvent({
          name: 'Socket update user settings error',
          properties: { error: 'Invalid user: userId is missing' },
        });
        return;
      }

      await db.users.update(userId, {
        settings: newSettings,
      });

      await callback({
        status: 'success',
      });

      appInsightsClient.trackEvent({
        name: 'User settings updated',
        properties: { settings: newSettings },
      });
    } catch (e) {
      console.error(e);
      appInsightsClient.trackEvent({
        name: 'Update user settings error',
        properties: { userId: userId, error: e },
      });

      callback({
        status: 'error',
      });
    }
  });

  socket.on('disconnect', async () => {
    try {
      // get which game the socket is in
      var gameId = socket.data.gameId;
      var userId = socket.data.userId;

      if (
        gameId === undefined ||
        userId === undefined ||
        gameId === null ||
        userId === null
      ) {
        console.log(
          'Socket disconnection error: gameId or userId is undefined'
        );

        appInsightsClient.trackEvent({
          name: 'Socket disconnection error',
          properties: { error: 'Invalid game or user' },
        });
        return;
      }

      // get game from db
      var dbGame = await db.games.getById(gameId);

      if (!dbGame) return;

      // get game type
      var gameType = gameTypes[dbGame._doc.typeId];

      // create instance of game
      var game = new gameType.Game(dbGame._doc);

      game.disconnectSocket(userId);

      // save game to db
      await db.games.update(gameId, game);

      for (let userId in game.sockets) {
        let socket = game.sockets[userId];
        if (socket != null) {
          io.to(socket).emit('contested', game.isConnectionContested(userId));
        }
      }

      appInsightsClient.trackEvent({
        name: 'Socket disconnected from game',
        properties: {
          gameId: gameId,
          userId: userId,
        },
      });
    } catch (e) {
      console.error(e);

      appInsightsClient.trackEvent({
        name: 'Socket disconnect handling error',
        properties: {
          gameId: gameId,
          userId: userId,
        },
      });
    }
  });
});

// Track all HTTP requests with Application Insights
app.use(function (req, res, next) {
  appInsightsClient.trackNodeHttpRequest({ request: req, response: res });
  next();
});

import createGameController from './controllers/create-game.controller.js';
app.post('/create-game', (req, res, next) => {
  appInsightsClient.trackEvent({
    name: 'Game created',
    properties: {
      typeId: req.body.options.typeId,
      guild: req.body.options.guild,
      channel: req.body.options.channel,
      userId: req.body.userId,
    },
  });
  createGameController(req, res, next);
});

let viteDevServer;
const isProduction = process.env.NODE_ENV === 'production';
// const root = `${path.dirname(import.meta.url)}/src`;
const root = `${__dirname}/src`;
const base = '/';
const baseAssets = '/';
const outDir = `dist`;

if (!isProduction) {
  // IF DEVELOPMENT

  // Create Vite server in middleware mode. This disables Vite's own HTML
  // serving logic and let the parent server take control.
  //
  // In middleware mode, if you want to use Vite's own HTML serving logic
  // use `'html'` as the `middlewareMode` (ref https://vitejs.dev/config/#server-middlewaremode)
  let { createServer: createViteServer } = await import('vite');
  let hmr = true;

  if (process.env.HOSTED_ON === 'gitpod') {
    hmr = false;
  }

  viteDevServer = await createViteServer({
    server: {
      middlewareMode: 'ssr',
      hmr,
    },
  });
  // use vite's connect instance as middleware
  app.use(viteDevServer.middlewares);
} else {
  // IF PRODUCTION
  app.use('/', express.static(path.resolve(__dirname, 'src/dist/client')));
}

import { createPageRenderer } from 'vite-plugin-ssr';

const renderPage = createPageRenderer({
  viteDevServer,
  isProduction,
  root,
  base,
  baseAssets,
  outDir,
});

app.get('*', async (req, res, next) => {
  const url = req.originalUrl;

  let cookie = req.cookies.accessToken;

  //check database if user is signed in
  let userId;
  let token;
  try {
    token = JWT.verify(
      cookie,
      process.env.JWT_SECRET as JWT.Secret
    ) as JWT.JwtPayload;
    userId = token.id;
  } catch (e) {
    userId = null;
  }

  const pageContextInit = {
    url,
    userId,
    redirectTo: null,
  };
  const pageContext = await renderPage(pageContextInit);

  if (pageContext.redirectTo) {
    if (pageContext.redirectTo === '/sign-in') {
      res.cookie('gameId', url.replace('/game/', ''), {
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
    }
    res.redirect(307, pageContext.redirectTo);
  } else if (!pageContext.httpResponse) {
    return next();
  } else {
    const { body, statusCode, contentType } = pageContext.httpResponse;
    if (url.startsWith('/game/')) {
      res.clearCookie('gameId');
    }
    res.status(statusCode).type(contentType).send(body);
  }
});

server.listen(host.port, () => {
  let duration = Date.now() - start;
  appInsights.defaultClient.trackMetric({
    name: 'Server startup time',
    value: duration,
  });
  console.log(`Game server host ${host.id} listening at port ${host.port}`);
});
