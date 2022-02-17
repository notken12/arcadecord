import { createSSRApp, h } from 'vue'
import { createStore } from '../js/box.js'
import GameView from 'components/base-ui/GameView.vue';
import ScoresView from 'components/base-ui/ScoresView.vue';

import VueAppInsights from '@app/js/vue-app-insights.js'

import { appInsights } from '@app/js/client-framework.js';

import baseMixin from 'components/base-ui/base.mixin.js';


export { createApp }

function createApp(pageContext) {
    const store = createStore()
    store.commit('SETUP', {
        game: pageContext.game,
        discordUser: pageContext.discordUser,
    })
    store.commit('REPLAY_TURN')
    
    const app = createSSRApp({
        render: () => h(pageContext.Page),
    })
    app.use(VueAppInsights, { appInsights });
    app.mixin(baseMixin);
    app.use(store)


    app.component('scores-view', ScoresView);
    app.component('game-view', GameView);
    return { app, store }
}