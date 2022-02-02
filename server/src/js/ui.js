import { createApp as createVueApp } from 'vue';
import cloneDeep from 'lodash.clonedeep';

import GameView from 'components/base-ui/GameView.vue';
import ScoresView from 'components/base-ui/ScoresView.vue';

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

    if (!GameFlow.isItMyTurn(store.state.game, true) || store.state.game.turns.length == 0) {
        // If it isn't my turn or I'm the first player, use data as is
        facade.state.game = store.state.game;
        facade.state.replaying = false;
    } else {
        if (store.state.game.turns[store.state.game.turns.length - 1].playerIndex === store.state.game.myIndex && !store.state.game.hasEnded) {
            // If I already played an action, use data as is
            facade.state.game = store.state.game;
            facade.state.replaying = false;
            return;
        }
        // If it is my turn, use the previous data to replay the last player's turn
        // Create a facade game state from the previous turn, go back in time to the last turn
        // Create clone of the game state
        facade.state.game = cloneDeep(store.state.game);
        // Change data to the previous turn's initial data
        facade.state.game.data = cloneDeep(store.state.game.previousData);
        // Set turn back to the last turn
        facade.state.game.turn = cloneDeep(facade.state.game.turns[facade.state.game.turns.length - 1].playerIndex);
        // Tell Vue app to handle turn replay animations
        facade.state.replaying = true;
        bus.emit('facade:replay-turn');
    }
}

function replayTurn() {
    // Replay the last player's turn
    // Use Facade to manage the game state for animations
    facade.commit('REPLAY_TURN');
}

function setupUI(serverResponse) {
    // Add server response data to the internal store
    store.commit('SETUP', serverResponse);
}

const createApp = (...options) => {
    facade.commit('REPLAY_TURN');
    /*var newOptions = options[0];
    // add mixin
    if (newOptions.mixins) {
        newOptions.mixins.push(baseMixin);
    } else {
        newOptions.mixins = [baseMixin];
    }*/
    const app = createVueApp(...options);
    app.use(VueAppInsights, { appInsights });
    app.use(facade);
    app.mixin(baseMixin);
    app.component('scores-view', ScoresView);
    app.component('game-view', GameView);
    return app;
}

export {
    GameView,
    createApp,
    store,
    setupFacade,
    replayTurn,
    setupUI
}
