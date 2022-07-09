// app.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { createSSRApp, h } from 'vue';

export { createApp };

function createApp(pageContext) {
  const app = createSSRApp(
    {
      render: () => h(pageContext.Page),
    },
    pageContext.pageProps
  );
  app.provide('pageContext', pageContext);
  return { app };
}
