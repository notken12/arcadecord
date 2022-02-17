import db from '../../../../db/db2.js';
import { fetchUser } from '../../../utils/discord-api';
import { gameTypes } from '../../games/game-types';
import { RenderErrorPage } from 'vite-plugin-ssr'
import { createApp } from '../../renderer/gameApp'
import { renderToString } from '@vue/server-renderer'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr'

export async function onBeforeRender(pageContext) {
    // The route parameter of `/game/:gameId` is available at `pageContext.routeParams`
    const { gameId } = pageContext.routeParams
    const passedPageContext = {}

    const pageProps = {}
    let componentToRender = null
    // FETCH GAME HERE

    const { userId } = pageContext;

    if (!userId) {
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
                // send game info to user
                const { typeId } = game;

                const { default: vueApp } = await import(`../../components/games/${typeId}/App.vue`);
                passedPageContext.Page = vueApp;

                passedPageContext.game = game.getDataForClient(userId);
                passedPageContext.discordUser = await fetchUser(userId);
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

    passedPageContext.pageProps = pageProps;

    // Our render and hydrate functions we defined earlier pass `pageContext.pageProps` to
    // the root Vue component `Page`; this is where we define `pageProps`.

    // We make `pageProps` available as `pageContext.pageProps`
    return {
        pageContext: passedPageContext
    }
}

export async function render(pageContext) {
    const { app, store } = createApp(pageContext)

    store.commit('SETUP', {
        game: pageContext.game,
        discordUser: pageContext.discordUser,
    })

    const appHtml = await renderToString(app)
    

    // See https://vite-plugin-ssr.com/head
    const { documentProps } = pageContext
    const title = (documentProps && documentProps.title) || 'Arcadecord'
    const desc = (documentProps && documentProps.description) || 'Message games for Discord'

    const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>

        <link rel="stylesheet" href="/scss/all-games.scss">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="preconnect" href="https://cdn.discordapp.com">
      </head>
      <body>
        <div id="app">${dangerouslySkipEscape(appHtml)}</div>
      </body>
    </html>`

    const INITIAL_STATE = store.state

    return {
        documentHtml,
        pageContext: {
            INITIAL_STATE
        },
    }
}

// By default `pageContext.*` are available only on the server. But our hydrate function
// we defined earlier runs in the browser and needs `pageContext.pageProps`; we use
// `passToClient` to tell `vite-plugin-ssr` to serialize and make `pageContext.pageProps`
// available to the browser.
export const passToClient = ['pageProps', 'INITIAL_STATE']