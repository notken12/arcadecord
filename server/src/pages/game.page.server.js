// game.page.server.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import db from '../../../db/db2.js';
import { fetchUser } from '../../utils/discord-api';
import { gameTypes } from '@app/games/game-types.js';
import { RenderErrorPage } from 'vite-plugin-ssr';
import { createApp } from '@app/renderer/gameApp';
// import { createApp } from '@app/renderer/app'
import { renderToString } from '@vue/server-renderer';
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr';
import { GameConnectionError } from '../games/GameErrors.js';

export async function onBeforeRender(pageContext) {
  // The route parameter of `/game/:gameId` is available at `pageContext.routeParams`
  const { gameId } = pageContext.routeParams;
  const passedPageContext = {};

  const pageProps = {};
  // FETCH GAME HERE

  const { userId } = pageContext;
  if (userId === null || userId === undefined) {
    return {
      pageContext: {
        documentHtml: null,
        redirectTo: '/sign-in',
      },
    };
  }

  const user = await db.users.getById(userId);
  if (!user) {
    return {
      pageContext: {
        documentHtml: null,
        redirectTo: '/sign-in',
      },
    };
  }

  if (user.banned) {
    throw RenderErrorPage({
      pageContext: {
        errorInfo: GameConnectionError.USER_BANNED,
      },
    });
  }

  if (gameId) {
    var dbGame = await db.games.getById(gameId);

    if (dbGame) {
      // get game type
      var gameType = gameTypes[dbGame._doc.typeId];

      // create instance of game
      var game = new gameType.Game(dbGame._doc);

      let cperm = await game.canUserSocketConnect(userId);

      if (cperm.ok) {
        // send game info to user
        const { typeId } = game;

        // const { default: vueApp } = await import(`../pages/App.vue`);
        // let { default: indexPage } = await import('./Loading.page.vue')

        pageProps.gameType = typeId;
        pageContext.game = game.getDataForClient(userId);
        pageContext.discordUser = await fetchUser(userId);
        // Are there multiple players trying to play this turn?
        pageContext.contested = game.isConnectionContested(userId);

        if (!pageContext.discordUser) {
          // Make user sign in if couldn't fetch discord user
          return {
            pageContext: {
              documentHtml: null,
              redirectTo: '/sign-in',
            },
          };
        }
        pageContext.user = user._doc;
      } else {
        // For some reason user isn't allowed to join (isn't in same server, game full, etc)
        throw RenderErrorPage({
          pageContext: {
            errorInfo: cperm.error,
          },
        });
      }
    } else {
      throw RenderErrorPage({
        pageContext: {
          errorInfo: GameConnectionError.GAME_NOT_FOUND,
        },
      });
    }
  } else {
    throw RenderErrorPage({
      pageContext: {
        errorInfo: GameConnectionError.GAME_NOT_FOUND,
      },
    });
  }
  const { Page } = pageContext;
  pageContext.pageProps = pageProps;

  return {
    pageContext: {
      Page,
      pageProps,
    },
  };
}

export async function render(pageContext) {
  // Pass it on to the server/index.js for redirection
  if (pageContext.redirectTo) {
    return {
      pageContext: {
        redirectTo: pageContext.redirectTo,
      },
    };
  }

  // Otherwise go ahead and render page
  const { app, store } = createApp(pageContext);

  // See https://vite-plugin-ssr.com/head
  const { documentProps } = pageContext;
  const title = (documentProps && documentProps.title) || 'Arcadecord';
  const desc =
    (documentProps && documentProps.description) || 'Message games for Discord';

  const INITIAL_STATE = store.state;

  // Expose everything except for discord access and refresh token
  let { settings, _id, discordId, joined } = pageContext.user;

  store.commit('SETUP', {
    game: pageContext.game,
    discordUser: pageContext.discordUser,
    user: {
      settings,
      _id,
      discordId,
      joined,
    },
    contested: pageContext.contested,
    realGame: pageContext.game,
  });
  store.commit('REPLAY_TURN');

  const appHtml = await renderToString(app);

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>

        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="preconnect" href="https://cdn.discordapp.com">

      </head>
      <body>
        <div id="app">${dangerouslySkipEscape(appHtml)}</div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      INITIAL_STATE,
      Page: pageContext.Page,
      pageProps: pageContext.pageProps,
    },
  };
}

// By default `pageContext.*` are available only on the server. But our hydrate function
// we defined earlier runs in the browser and needs `pageContext.pageProps`; we use
// `passToClient` to tell `vite-plugin-ssr` to serialize and make `pageContext.pageProps`
// available to the browser.
export const passToClient = ['pageProps', 'INITIAL_STATE'];
