import { createApp as createVueApp } from 'vue'
import cloneDeep from 'lodash.clonedeep'

import GameView from 'components/base-ui/GameView.vue'
import ScoresView from 'components/base-ui/ScoresView.vue'

import VueAppInsights from './vue-app-insights.js'

import { appInsights } from './client-framework.js'

import baseMixin from '../components/base-ui/base.mixin.js'
import GameFlow from './GameFlow.js'

import bus from './vue-event-bus'

function replayTurn() {
  // Replay the last player's turn
  // Use Facade to manage the game state for animations
  facade.commit('REPLAY_TURN')
}

const createApp = (...options) => {
  facade.commit('REPLAY_TURN')
  /*var newOptions = options[0];
    // add mixin
    if (newOptions.mixins) {
        newOptions.mixins.push(baseMixin);
    } else {
        newOptions.mixins = [baseMixin];
    }*/
  const app = createVueApp(...options)
  app.use(VueAppInsights, { appInsights })
  app.use(facade)

  app.mixin(baseMixin)
  app.component('scores-view', ScoresView)
  app.component('game-view', GameView)
  return app
}

export { GameView, createApp, replayTurn }
