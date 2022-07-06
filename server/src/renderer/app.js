// app.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { createSSRApp, h } from 'vue';

import VueAppInsights from '@app/js/vue-app-insights.js';

import { appInsights } from '@app/js/app-insights.js';

export { createApp };

function createApp(pageContext) {
  const app = createSSRApp({
    render: () => h(pageContext.Page),
  });
  app.use(VueAppInsights, { appInsights });

  app.provide('pageContext', pageContext);
  return { app };
}
