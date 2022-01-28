import { createApp as createVueApp } from 'vue';
import cloneDeep from 'lodash.clonedeep';

import 'scss/all-games.scss';

import GameView from 'components/base-ui/GameView.vue';

import VueAppInsights from './vue-app-insights.js'

import { appInsights } from './client-framework.js';

import store from './store.js';
import facade from './box.js';

import baseMixin from '../components/base-ui/base.mixin.js';
import GameFlow from './GameFlow.js';

import bus from './vue-event-bus';

function setupFacade() {
    facade.state.me = store.state.me;
    facade.state.error = store.state.error;
    let data = null;
    let willReplay = false;
    if (!GameFlow.isItMyTurn(store.state.game) || store.state.game.turns.length == 0) {
        // If it isn't my turn or I'm the first player, use data as is
        data = store.state.game.data;
    } else {
        // If it is my turn, use the previous data to replay the last player's turn
        data = store.state.game.previousData;
        willReplay = true;
    }
    facade.state.game = cloneDeep(store.state.game);
    facade.state.game.data = data;
    facade.state.replaying = willReplay;
    if (willReplay) {
        bus.emit('facade:replay-turn');
    }
}

const createApp = (...options) => {
    setupFacade();
    /*var newOptions = options[0];
    // add mixin
    if (newOptions.mixins) {
        newOptions.mixins.push(baseMixin);
    } else {
        newOptions.mixins = [baseMixin];
    }*/
    const app = createVueApp(...options);
    app.mixin(baseMixin);
    app.use(VueAppInsights, { appInsights });
    app.component('game-view', GameView);
    return app;
}

export {
    GameView,
    createApp,
    store,
    setupFacade
}
