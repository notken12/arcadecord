// gameApp.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { createSSRApp, h } from 'vue';
import { createStore } from '../js/box.js';
import GameView from 'components/base-ui/GameView.vue';
import ScoresView from 'components/base-ui/ScoresView.vue';

import VueAppInsights from '@app/js/vue-app-insights.js';

import { appInsights } from '@app/js/client-framework.js';

import baseMixin from 'components/base-ui/base.mixin.js';
import * as Client from '@app/js/client-framework.js';

export { createApp };

function createApp(pageContext) {
  const store = createStore();
  // Client.utils.setUpGame(pageContext.INITIAL_STATE.game)

  const app = createSSRApp({
    render: () => h(pageContext.Page, pageContext.pageProps || {}),
  });
  app.use(VueAppInsights, { appInsights });
  app.mixin(baseMixin);
  app.use(store);

  app.component('scores-view', ScoresView);
  app.component('game-view', GameView);
  return { app, store };
}
