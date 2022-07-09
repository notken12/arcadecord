// _default.page.server.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { renderToString } from '@vue/server-renderer';
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr';
import { createApp } from './app';

export { render };
// export {onBeforeRoute}

// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = ['pageProps', 'urlPathname', 'errorInfo'];

async function render(pageContext) {
  const { app } = createApp(pageContext);

  const appHtml = await renderToString(app);

  // See https://vite-plugin-ssr.com/head
  const { documentProps } = pageContext;
  const title = (documentProps && documentProps.title) || 'Arcadecord';
  const desc =
    (documentProps && documentProps.description) || 'Message games for Discord';

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>

        <link rel="icon" href="/favicon.ico" type="image/x-icon" />

        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

        <link rel="preload" href="https://fonts.googleapis.com/icon?family=Material+Icons" as="style">
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@500&family=Inter:wght@400;500;700&family=Work+Sans:wght@400;500;700&display=swap" as="style">
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9949308515923091"
     crossorigin="anonymous"></script>
      </head>
      <body>
        <div id="app">${dangerouslySkipEscape(appHtml)}</div>
        <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
    },
  };
}
