import { renderToString } from '@vue/server-renderer'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr'
import { createApp } from './app'

export { render }
// export {onBeforeRoute}

// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = ['pageProps', 'urlPathname']

async function render(pageContext) {
  const { app } = createApp(pageContext)

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
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
    },
  }
}

// function onBeforeRoute(pageContext) {
//   let { url } = pageContext

//   if (url.startsWith('/game/')) {
//     const gameId = url.split('/game/')[1]
//     if (gameId) {
//       var dbGame = await db.games.getById(gameId);

//       if (dbGame) {
//         // get game type
//         var gameType = gameTypes[dbGame._doc.typeId]

//         // create instance of game
//         var game = new gameType.Game(dbGame._doc);

//         if (await game.canUserSocketConnect(userId)) {
//           // send game info to user
//           const { typeId } = game;

//           // const { default: vueApp } = await import(`../pages/App.vue`);
//           // let { default: indexPage } = await import('./Loading.page.vue')

//           url = `/games/${typeId}/App`
//           pageContext.game = game.getDataForClient(userId);
//           pageContext.discordUser = await fetchUser(userId);
//         } else {
//           // For some reason user isn't allowed to join (isn't in same server, game full, etc)
//           throw RenderErrorPage({
//             pageContext: {
//               errorInfo: 'You are not allowed to join this game. (You are not in the same server, game is full, etc)',
//             }
//           })
//         }
//       } else {
//         throw RenderErrorPage({
//           pageContext: {
//             errorInfo: 'Game not found',
//           }
//         })
//       }
//     } else {
//       throw RenderErrorPage({
//         pageContext: {
//           errorInfo: 'Game not found',
//         }
//       })
//     }
//   }

//   return {
//     pageContext: {
//       // We make `locale` available as `pageContext.locale`.
//       // We can then use https://vite-plugin-ssr.com/pageContext-anywhere
//       // to access `pageContext.locale` in any React/Vue component.
//       // We overwrite the original URL
//       url
//     }
//   }
// }