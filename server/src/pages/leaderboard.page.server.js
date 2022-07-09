import db from '../../../db/db2.js';
import { RenderErrorPage } from 'vite-plugin-ssr';

export async function onBeforeRender(
  /** @type import('vite-plugin-ssr').PageContextBuiltIn */
  pageContext
) {
  // Route params: ./leaderboard.page.route.js
  const { serverId } = pageContext.routeParams;
  const server = await db.servers.getById(serverId);

  if (server == null) {
    throw RenderErrorPage({
      pageContext: {
        is404: true,
      },
    });
  }

  return {
    pageContext: {
      pageProps: {
        server,
      },
    },
  };
}
