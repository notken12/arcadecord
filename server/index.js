// index.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

let start = Date.now()

import dotenv from 'dotenv'
dotenv.config({
  path: './server/.env',
})

import express from 'express'
const app = express()

// Compress all requests
app.use(shrinkRay())

// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser())

app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)

import { createServer } from 'http'
const server = createServer(app)
import { Server } from 'socket.io'
import { parse } from 'cookie'
import cookieParser from 'cookie-parser'
import fs from 'fs'
import cors from 'cors'
import JWT from 'jsonwebtoken'
import shrinkRay from 'shrink-ray-current'

import db from '../db/db2.js'

import { fetchUser, fetchUserFromAccessToken } from './utils/discord-api.js'
import { gameTypes } from './src/games/game-types.js'
import Action from './src/games/Action.js'
import Turn from './src/games/Turn.js'

import appInsights from 'applicationinsights'

appInsights
  .setup(process.env.APPINSIGHTS_CONNECTIONSTRING)
  .setSendLiveMetrics(true)

const appInsightsClient = appInsights.defaultClient

appInsights.start()

// get __dirname
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename)

// Connect to database
await db.connect(process.env.MONGODB_URI)

// get architecture from config
import architecture from './config/architecture.js'

const { hosts } = architecture

// get the current host info
const hostId = process.argv[2]
const host = hosts.find((host) => host.id === hostId)

var port

if (
  process.env.NODE_ENV === 'production' &&
  process.env.HOSTED_ON === 'heroku'
) {
  port = process.env.PORT
} else {
  port = host.port
}

// Create snowflake generator
import { Generator } from 'snowflake-generator'
const SnowflakeGenerator = new Generator(946684800000, hosts.indexOf(host))

app.use(cors())

// Health check
app.head('/health', function (req, res) {
  res.sendStatus(200)
})

// app.use('/public', express.static(path.resolve('build/server/public')));
// app.use('/dist', express.static(path.resolve('build/server/dist')));

// Check the name of the host
app.get('/name', function (req, res) {
  res.send(host.name)
})

//console.log(vite.middlewares.stack[5].handle.toString());

async function useBuiltFile(pathName, req, res) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // Dev mode, use Vite dev server
      const url = req.originalUrl
      // 1. Read html file
      let template = fs.readFileSync(path.resolve(__dirname, pathName), 'utf-8')

      // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
      //    also applies HTML transforms from Vite plugins, e.g. global preambles
      //    from @vitejs/plugin-react
      template = await viteDevServer.transformIndexHtml(url, template)

      // 6. Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    } else {
      // Production, use static built files
      var prefix = path.resolve(__dirname, './src')
      var filePath = path
        .resolve(__dirname, pathName)
        .replace(path.resolve(prefix, './public'), `${__dirname}/dist`)
        .replace(prefix, `${__dirname}/src/dist`)
      res.sendFile(filePath)
    }
  } catch (err) {
    // Send internal server error
    console.error(err)
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
  let duration = Date.now() - start
  appInsights.defaultClient.trackMetric({
    name: 'Server startup time',
    value: duration,
  })
  console.log(`Server host ${hostId} listening at port ${port}`)
})

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'arcadecord.herokuapp.com'],
  },
})

// Use redis adapter to communicate socket data with other hosts
// import redis from 'socket.io-redis';
// io.adapter(redis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }));

import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'

const pubClient = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
})
pubClient.on('error', (err) => {
  console.error(`Error in redis client: ${err}`)
})
const subClient = pubClient.duplicate()

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient))
})

io.on('connection', (socket) => {
  appInsightsClient.trackEvent({ name: 'Socket opened' })
  //console.log('a user connected');

  socket.on('connect_socket', async function (data, callback) {
    const cookies = parse(socket.request.headers.cookie || '')

    let cookie = cookies.accessToken

    let tokenUserId
    let token
    try {
      token = JWT.verify(cookie, process.env.JWT_SECRET)
      tokenUserId = token.id
    } catch (e) {
      //user is not signed in. or has an invalid access token
      //set cookie for game id to redirect back to
      //redirect to sign in page
      callback({
        error: 'Invalid access token',
      })
      appInsightsClient.trackEvent({
        name: 'Socket connection error',
        properties: { error: 'Invalid access token' },
      })
      return
    }

    var user = await db.users.getById(tokenUserId)
    if (!user) {
      callback({
        error: 'Invalid access token',
      })

      appInsightsClient.trackEvent({
        name: 'Socket connection error',
        properties: { error: 'Invalid access token' },
      })
      return
    }

    const userId = user._id
    const gameId = data.gameId

    if (!userId) {
      callback({
        error: 'Invalid user id',
      })

      appInsightsClient.trackEvent({
        name: 'Socket connection error',
        properties: { error: 'Invalid user id' },
      })
      return
    }

    if (gameId) {
      var dbGame = await db.games.getById(gameId)

      if (dbGame) {
        // get game type
        var gameType = gameTypes[dbGame._doc.typeId]

        // create instance of game
        var game = new gameType.Game(dbGame._doc)

        if ((await game.canUserSocketConnect(userId)).ok) {
          // Disconnect socket from other tab
          let oldSocket = game.getSocket(userId)
          io.to(oldSocket).disconnectSockets(true)

          // Disconnect reasons:
          // https://socket.io/docs/v4/client-api/#event-disconnect

          // set socket info
          socket.data.userId = userId
          socket.data.gameId = gameId

          // add socket to game room for broadcasting events
          socket.join('game/' + gameId)

          game.setSocket(userId, socket.id)

          // save game to db
          await db.games.update(gameId, game)

          // Expose all user data except for refresh and access token
          let { settings, _id, discordId, joined } = user._doc

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
          })

          appInsightsClient.trackEvent({
            name: 'Socket connection',
            properties: { gameId: gameId, userId: userId },
          })
        } else {
          // For some reason user isn't allowed to join (isn't in same server, game full, etc)
          callback({
            status: 'error',
            error: `No permission to join game (isn't in same server, game full, etc)`,
          })
        }
      } else {
        callback({
          status: 'error',
          error: 'Game not found',
        })
      }
    } else {
      callback({
        status: 'error',
        error: 'Game not found',
      })
    }
  })

  socket.on('action', async (type, data, callback) => {
    try {
      // get which game the socket is in
      var gameId = socket.data.gameId
      var userId = socket.data.userId

      if (
        gameId === undefined ||
        userId === undefined ||
        gameId === null ||
        userId === null
      ) {
        console.log('Socket action error: gameId or userId is undefined')
        callback({
          error: 'Invalid game or user',
        })

        appInsightsClient.trackEvent({
          name: 'Socket action error',
          properties: { error: 'Invalid game or user' },
        })
        return
      }

      // get game from db
      var dbGame = await db.games.getById(gameId)

      if (!dbGame) return

      // get game type
      var gameType = gameTypes[dbGame._doc.typeId]

      // create instance of game
      var game = new gameType.Game(dbGame._doc)

      var oldTurn = game.turn + 0

      // perform action
      var action = new Action(type, data, userId)
      var result = await game.handleAction(action)

      if (!result.success) {
        callback({
          error: 'Invalid action',
        })
        return
      }

      // save game to db
      await db.games.update(gameId, game)

      // send result to client
      await callback(result)

      if (game.turn !== oldTurn) {
        var player = game.players[game.turn]
        //console.log(`Player ${player.id}`);
        var s = game.sockets[player.id]
        //console.log(`Socket ${s}`);

        // send turn to next user
        if (s) {
          var gameData = game.getDataForClient(player.id)
          var turnData = Turn.getDataForClient(
            game.turns[game.turns.length - 1],
            player.id
          )
          await io.to(s).emit('turn', gameData, turnData)
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
      })
    } catch (e) {
      console.error(e)

      appInsightsClient.trackEvent({
        name: 'Action error',
        properties: {
          gameId: gameId,
          userId: userId,
          type: type,
          result: result,
          id: action.id,
          action: action,
        },
      })

      callback({
        error: 'Error handling action',
      })
    }
  })

  socket.on('resend invite', async (callback) => {
    try {
      // get which game the socket is in
      var gameId = socket.data.gameId
      var userId = socket.data.userId

      if (
        gameId === undefined ||
        userId === undefined ||
        gameId === null ||
        userId === null
      ) {
        console.log('Socket resend invite error: gameId or userId is undefined')
        callback({
          error: 'Invalid game or user',
        })

        appInsightsClient.trackEvent({
          name: 'Socket resend invite error',
          properties: { error: 'Invalid game or user' },
        })
        return
      }

      // get game from db
      var dbGame = await db.games.getById(gameId)

      if (!dbGame) return

      // get game type
      var gameType = gameTypes[dbGame._doc.typeId]

      // create instance of game
      var game = new gameType.Game(dbGame._doc)

      game.resending = true
      // trigger turn event handler to resend invite
      await game.emit('turn')

      // save game to db
      await db.games.update(gameId, game)

      // send result to client
      await callback({ status: 'success' })

      appInsightsClient.trackEvent({
        name: 'Resend game invite',
        properties: { gameId: gameId, userId: userId },
      })
    } catch (e) {
      console.error(e)

      appInsightsClient.trackEvent({
        name: 'Resend game invite error',
        properties: { gameId: gameId, userId: userId, error: e },
      })

      callback({
        status: 'error',
      })
    }
  })

  socket.on('settings:update', async (newSettings, callback) => {
    try {
      // get which game the socket is in
      var userId = socket.data.userId

      if (userId === undefined || userId === null) {
        console.log('Socket update user settings error: userId is missing')
        callback({
          error: 'Invalid user',
        })

        appInsightsClient.trackEvent({
          name: 'Socket update user settings error',
          properties: { error: 'Invalid user: userId is missing' },
        })
        return
      }

      await db.users.update(userId, {
        settings: newSettings,
      })

      await callback({
        status: 'success',
      })

      appInsightsClient.trackEvent({
        name: 'User settings updated',
        properties: { settings: newSettings },
      })
    } catch (e) {
      console.error(e)
      appInsightsClient.trackEvent({
        name: 'Update user settings error',
        properties: { userId: userId, error: e },
      })

      callback({
        status: 'error',
      })
    }
  })

  socket.on('disconnect', async () => {
    try {
      // get which game the socket is in
      var gameId = socket.data.gameId
      var userId = socket.data.userId

      if (
        gameId === undefined ||
        userId === undefined ||
        gameId === null ||
        userId === null
      ) {
        console.log('Socket disconnection error: gameId or userId is undefined')

        appInsightsClient.trackEvent({
          name: 'Socket disconnection error',
          properties: { error: 'Invalid game or user' },
        })
        return
      }

      // get game from db
      var dbGame = await db.games.getById(gameId)

      if (!dbGame) return

      // get game type
      var gameType = gameTypes[dbGame._doc.typeId]

      // create instance of game
      var game = new gameType.Game(dbGame._doc)

      game.disconnectSocket(userId)

      // save game to db
      await db.games.update(gameId, game)

      for (let userId in game.sockets) {
        io.to(game.sockets[userId]).emit(
          'contested',
          game.isConnectionContested(userId)
        )
      }

      appInsightsClient.trackEvent({
        name: 'Socket disconnected from game',
        properties: {
          gameId: gameId,
          userId: userId,
        },
      })
    } catch (e) {
      console.error(e)

      appInsightsClient.trackEvent({
        name: 'Socket disconnect handling error',
        properties: {
          gameId: gameId,
          userId: userId,
        },
      })
    }
  })
})

// Track all HTTP requests with Application Insights
app.use(function (req, res, next) {
  appInsightsClient.trackNodeHttpRequest({ request: req, response: res })
  next()
})

/*app.get('/vite/:url', (req, res) => {
  console.log(req.params.url);
  proxyViteDev(req.params.url, res);
})*/

// Use controllers to handle requests
import authController from './controllers/auth.controller.js'
import signOutController from './controllers/sign-out.controller.js'

app.get('/discord-oauth', (req, res) => {
  res.redirect(
    'https://discord.com/api/oauth2/authorize?client_id=903801669194772531&redirect_uri=' +
      encodeURIComponent(process.env.GAME_SERVER_URL + '/auth') +
      '&response_type=code&scope=identify'
  )
})

//get authorization code
app.get('/auth', authController)

app.get('/game/:gameId', async (req, res, next) => {
  if (
    req.params.gameId !== undefined &&
    req.params.gameId !== null &&
    req.params.gameId !== 'favicon.ico'
  ) {
    res.cookie('gameId', req.params.gameId, {
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })
  }

  next()
})

import createGameController from './controllers/create-game.controller.js'
app.post('/create-game', createGameController)

import signInController from './controllers/sign-in.controller.js'
app.get('/sign-in', signInController)

app.get('/invite', (req, res) => {
  res.redirect(
    'https://discord.com/api/oauth2/authorize?client_id=' +
      process.env.BOT_CLIENT_ID +
      '&redirect_uri=' +
      encodeURIComponent(process.env.GAME_SERVER_URL + '/auth') +
      '&response_type=code&scope=bot%20applications.commands%20identify%20email'
  )
})

app.get('/sign-out', signOutController)

import { createPageRenderer } from 'vite-plugin-ssr'

var viteDevServer
const isProduction = process.env.NODE_ENV === 'production'
// const root = `${path.dirname(import.meta.url)}/src`;
const root = `${__dirname}/src`
const base = '/'
const baseAssets = '/'
const outDir = `dist`

if (!isProduction) {
  // IF DEVELOPMENT

  // Create Vite server in middleware mode. This disables Vite's own HTML
  // serving logic and let the parent server take control.
  //
  // In middleware mode, if you want to use Vite's own HTML serving logic
  // use `'html'` as the `middlewareMode` (ref https://vitejs.dev/config/#server-middlewaremode)
  let { createServer: createViteServer } = await import('vite')
  let hmr = true

  if (process.env.HOSTED_ON === 'gitpod') {
    hmr = false
  }

  viteDevServer = await createViteServer({
    server: {
      middlewareMode: 'ssr',
      hmr,
    },
  })
  // use vite's connect instance as middleware
  app.use(viteDevServer.middlewares)
} else {
  // IF PRODUCTION
  app.use('/', express.static(path.resolve(__dirname, 'src/dist/client')))
}

const renderPage = createPageRenderer({
  viteDevServer,
  isProduction,
  root,
  base,
  baseAssets,
  outDir,
})

const apiRoutes = [
  '/create-game',
  '/auth',
  '/invite-successful',
  '/discord-oauth2-sign-in',
  '/discord-oauth2-invite-bot',
  '/sign-in',
]

app.get('*', async (req, res, next) => {
  const url = req.originalUrl
  let matchingRoute = apiRoutes.find((r) => url.startsWith(r))
  if (matchingRoute) return next()

  let cookie = req.cookies.accessToken

  //check database if user is signed in
  let userId
  let token
  try {
    token = JWT.verify(cookie, process.env.JWT_SECRET)
    userId = token.id
  } catch (e) {
    userId = null
  }

  const pageContextInit = {
    url,
    userId,
  }
  const pageContext = await renderPage(pageContextInit)
  const { httpResponse } = pageContext

  if (pageContext.redirectTo) {
    res.redirect(307, pageContext.redirectTo)
  } else if (!pageContext.httpResponse) {
    return next()
  } else {
    const { body, statusCode, contentType } = pageContext.httpResponse
    res.status(statusCode).type(contentType).send(body)
  }
})

export const handler = app
