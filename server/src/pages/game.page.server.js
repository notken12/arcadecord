import db from '../../../db/db2.js';
import { fetchUser } from '../../utils/discord-api';
import { gameTypes } from '@app/games/game-types.js';
import { RenderErrorPage } from 'vite-plugin-ssr'
import { createApp } from '@app/renderer/gameApp'
// import { createApp } from '@app/renderer/app'
import { renderToString } from '@vue/server-renderer'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr'
import * as Client from '@app/js/client-framework.js';

export async function onBeforeRender(pageContext) {

    // The route parameter of `/game/:gameId` is available at `pageContext.routeParams`
    const { gameId } = pageContext.routeParams
    const passedPageContext = {}

    const pageProps = {}
    // FETCH GAME HERE

    const { userId } = pageContext;

    if (gameId) {
        var dbGame = await db.games.getById(gameId);

        if (dbGame) {
            // get game type
            var gameType = gameTypes[dbGame._doc.typeId]

            // create instance of game
            var game = new gameType.Game(dbGame._doc);
            console.log(userId);

            if (await game.canUserSocketConnect(userId)) {
                // send game info to user
                const { typeId } = game;

                // const { default: vueApp } = await import(`../pages/App.vue`);
                // let { default: indexPage } = await import('./Loading.page.vue')

                pageProps.gameType = typeId;
                pageContext.game = game.getDataForClient(userId);
                pageContext.discordUser = await fetchUser(userId);
            } else {
                // For some reason user isn't allowed to join (isn't in same server, game full, etc)
                throw RenderErrorPage({
                    pageContext: {
                        errorInfo: 'You are not allowed to join this game. (You are not in the same server, game is full, etc)',
                    }
                })
            }
        } else {
            throw RenderErrorPage({
                pageContext: {
                    errorInfo: 'Game not found',
                }
            })
        }
    } else {
        throw RenderErrorPage({
            pageContext: {
                errorInfo: 'Game not found',
            }
        })
    }
    const { Page } = pageContext
    pageContext.pageProps = pageProps

    return {
        pageContext: {
            Page,
            pageProps,
        },
    }
}

export async function render(pageContext) {
    const { app, store } = createApp(pageContext)

    // See https://vite-plugin-ssr.com/head
    const { documentProps } = pageContext
    const title = (documentProps && documentProps.title) || 'Arcadecord'
    const desc = (documentProps && documentProps.description) || 'Message games for Discord'

    const INITIAL_STATE = store.state

    store.commit('SETUP', {
        game: pageContext.game,
        discordUser: pageContext.discordUser,
    })
    store.commit('REPLAY_TURN')

    const appHtml = await renderToString(app)

    const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>

        <link rel="icon" href="/icons/favicon.ico" type="image/x-icon" />

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="preconnect" href="https://cdn.discordapp.com">

      </head>
      <body>
        <div id="app">${dangerouslySkipEscape(appHtml)}</div>
      </body>
    </html>`

    return {
        documentHtml,
        pageContext: {
            INITIAL_STATE,
            Page: pageContext.Page,
            pageProps: pageContext.pageProps,
        },
    }
}

// By default `pageContext.*` are available only on the server. But our hydrate function
// we defined earlier runs in the browser and needs `pageContext.pageProps`; we use
// `passToClient` to tell `vite-plugin-ssr` to serialize and make `pageContext.pageProps`
// available to the browser.
export const passToClient = ['pageProps', 'INITIAL_STATE']