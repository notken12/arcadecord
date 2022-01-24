import {createApp as createVueApp} from 'vue';

import 'scss/all-games.scss';

import GameView from 'components/base-ui/GameView.vue';

import VueAppInsights from './vue-app-insights.js'

import {appInsights} from './client-framework.js';

const createApp = (...options) => {
    const app = createVueApp(...options);
    app.use(VueAppInsights, { appInsights });
    app.component('game-view', GameView);
    return app;
}

export {
    GameView,
    createApp
}