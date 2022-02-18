import db from '../../../db/db2.js';
import { fetchUser } from '../../utils/discord-api';
import { gameTypes } from '@app/games/game-types';
import { RenderErrorPage } from 'vite-plugin-ssr'
import { createApp } from '@app/renderer/gameApp'
// import { createApp } from '@app/renderer/app'
import { renderToString } from '@vue/server-renderer'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr'

export async function onBeforeRender(pageContext) {
    // let { default: indexPage } = await import('../pages/Loading.page.vue')
    // pageContext.Page = indexPage

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

            if (await game.canUserSocketConnect(userId)) {
                // send game info to user
                const { typeId } = game;

                const { default: vueApp } = await import(`../components/games/${typeId}/App.vue`);
                // const { default: vueApp } = await import(`../pages/App.vue`);
                // let { default: indexPage } = await import('./Loading.page.vue')
                pageContext.Page = vueApp;

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

    const { app, store } = createApp({ Page })

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

    return {
        pageContext: {
            INITIAL_STATE,
            appHtml,
            Page
        },
    }
}

export async function render(pageContext) {
    const { appHtml } = pageContext
    const documentHtml = escapeInject`<!DOCTYPE html>
    <html>
      <body>
        <div id="app">${dangerouslySkipEscape(appHtml)}</div>
      </body>
    </html>`

    console.log(pageContext.Page)

    return {
        documentHtml,
        pageContext: {
            INITIAL_STATE: pageContext.INITIAL_STATE,
            Page: pageContext.Page,
        },
    }
}

// By default `pageContext.*` are available only on the server. But our hydrate function
// we defined earlier runs in the browser and needs `pageContext.pageProps`; we use
// `passToClient` to tell `vite-plugin-ssr` to serialize and make `pageContext.pageProps`
// available to the browser.
export const passToClient = ['pageProps', 'INITIAL_STATE']