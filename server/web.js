// web.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

let start = Date.now();

import dotenv from 'dotenv';
dotenv.config();

// Get host configuration
import { loadWebHostConfig } from './web/config.js';
const host = loadWebHostConfig();

import express from 'express';
const app = express();

import shrinkRay from 'shrink-ray-current';
// Compress all requests
app.use(shrinkRay());

// need cookieParser middleware before we can do anything with cookies
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
import { parse } from 'cookie';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import cors from 'cors';
import JWT from 'jsonwebtoken';

import db from '../db/db2.js';

import { gameTypes } from './src/games/game-types.js';
import Action from './src/games/Action.js';
import Turn from './src/games/Turn.js';

import appInsights from 'applicationinsights';

appInsights
  .setup(process.env.APPINSIGHTS_CONNECTIONSTRING)
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
await db.connect(process.env.MONGODB_URI);

app.use(cors());

// Health check
app.head('/health', function (req, res) {
  res.sendStatus(200);
});

// Check the name of the host
app.get('/name', function (req, res) {
  res.send(host.name);
});

server.listen(host.port, () => {
  let duration = Date.now() - start;
  appInsights.defaultClient.trackMetric({
    name: 'Server startup time',
    value: duration,
  });
  console.log(`Web host ${host.id} listening at port ${host.port}`);
});

// Track all HTTP requests with Application Insights
app.use(function (req, res, next) {
  appInsightsClient.trackNodeHttpRequest({ request: req, response: res });
  next();
});

app.get('/discord-oauth', (req, res) => {
  res.redirect(
    'https://discord.com/api/oauth2/authorize?client_id=903801669194772531&redirect_uri=' +
      encodeURIComponent(host.url + '/auth') +
      '&response_type=code&scope=identify'
  );
});

// Use controllers to handle requests
import authController from './controllers/auth.controller.js';
import signOutController from './controllers/sign-out.controller.js';

//get authorization code
app.get('/auth', authController);

app.get('/game/:gameId', async (req, res, next) => {
  if (
    req.params.gameId !== undefined &&
    req.params.gameId !== null &&
    req.params.gameId !== 'favicon.ico'
  ) {
    res.cookie('gameId', req.params.gameId, {
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
  }

  next();
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

app.get('/discord-invite', (_req, res) => {
  res.redirect(host.discordServerInvite);
});

app.get('/ko-fi', (_req, res) => {
  res.redirect('https://ko-fi.com/arcadecord');
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

const renderPage = createPageRenderer({
  viteDevServer,
  isProduction,
  root,
  base,
  baseAssets,
  outDir,
});

const apiRoutes = [
  '/create-game',
  '/auth',
  '/invite-successful',
  '/discord-oauth2-sign-in',
  '/discord-oauth2-invite-bot',
  '/sign-in',
  '/discord-invite',
];

import { createPageRenderer } from 'vite-plugin-ssr';

app.get('*', async (req, res, next) => {
  const url = req.originalUrl;
  let matchingRoute = apiRoutes.find((r) => url.startsWith(r));
  if (matchingRoute) return next();

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
  };
  const pageContext = await renderPage(pageContextInit);

  if (pageContext.redirectTo) {
    res.redirect(307, pageContext.redirectTo);
  } else if (!pageContext.httpResponse) {
    return next();
  } else {
    const { body, statusCode, contentType } = pageContext.httpResponse;
    res.status(statusCode).type(contentType).send(body);
  }
});

export const handler = app;
