import db from '../../../db/db2.js';
import { RenderErrorPage } from 'vite-plugin-ssr';
import cloneDeep from 'lodash.clonedeep';

/**
 * @typedef {Object} UserStats
 * @prop {number} gamesPlayed
 * @prop {number} gamesWon
 *
 * @typedef {UserStats & import('../games/Player').DiscordUser} User
 *
 * @typedef {Object} Stats
 * @prop {Map.<string, User>} users
 * @prop {number} gamesPlayed
 *
 * @typedef {Object} Server
 * @prop {Stats} stats
 * @prop {string} name
 * @prop {string} iconURL
 */

export async function onBeforeRender(
  /** @type import('vite-plugin-ssr').PageContextBuiltIn */
  pageContext
) {
  // Route params: ./leaderboard.page.route.js
  const { serverId } = pageContext.routeParams;
  let serverRes = await db.servers.getById(serverId);

  if (serverRes == null) {
    throw RenderErrorPage({
      pageContext: {
        is404: true,
      },
    });
  }

  /** @type Server */
  let server = serverRes._doc;
  server.stats.games = Object.fromEntries(server.stats.games);
  return {
    pageContext: {
      pageProps: {
        server,
      },
    },
  };
}
