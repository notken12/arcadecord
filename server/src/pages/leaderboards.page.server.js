import db from '../../../db/db2.js';
import { RenderErrorPage } from 'vite-plugin-ssr';
import cloneDeep from 'lodash.clonedeep';

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
