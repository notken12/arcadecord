import { reactive, ref } from 'vue'
import { createStore as createVuexStore } from 'vuex'
import cloneDeep from 'lodash.clonedeep'

import { createStore as createInternalStore } from './store'
import bus from './vue-event-bus'
import GameFlow from './GameFlow.js'
import { runAction } from './client-framework'

// A facade layered over the store to provide a more convenient API for game Vue components
// Used for playing turn replays

export { createStore }

function createStore() {
  const store = createInternalStore()
  const facade = createVuexStore({
    debug: import.meta.env.MODE === 'development',
    state() {
      return {
        game: null,
        me: null,
        error: null,
        replaying: false,
        runningAction: false,
        user: null,
      }
    },
    mutations: {
      SETUP(state, connectionResponse) {
        store.commit('SETUP', connectionResponse)
        state.user = store.state.user
      },
      REPLAY_TURN(state) {
        state.me = store.state.me
        state.error = store.state.error
        state.user = store.state.user

        if (
          (!GameFlow.isItMyTurn(store.state.game, true) &&
            !store.state.game.hasEnded) ||
          store.state.game.turns.length == 0
        ) {
          // If it isn't my turn or I'm the first player, use data as is
          state.game = store.state.game
          state.replaying = false
        } else {
          if (
            store.state.game.turns[store.state.game.turns.length - 1]
              .playerIndex === store.state.game.myIndex &&
            !store.state.game.hasEnded
          ) {
            // If I already played an action, use data as is
            state.game = store.state.game
            state.replaying = false
            return
          }
          // If it is my turn, use the previous data to replay the last player's turn
          // Create a facade game state from the previous turn, go back in time to the last turn
          // Create clone of the game state
          state.game = cloneDeep(store.state.game)
          // Change data to the previous turn's initial data
          state.game.data = cloneDeep(store.state.game.previousData)
          // Set turn back to the last turn
          state.game.turn = cloneDeep(
            state.game.turns[state.game.turns.length - 1].playerIndex
          )
          // Set myIndex to the previous turn's playerIndex
          // state.game.myIndex = cloneDeep(state.game.turns[state.game.turns.length - 1].playerIndex);
          // Tell Vue app to handle turn replay animations
          state.replaying = true
          bus.emit('facade:replay-turn')
        }
      },
      START_ACTION_ANIMATION(state) {
        state.runningAction = true
      },
      END_ACTION_ANIMATION(state) {
        state.runningAction = false

        if (this.debug) {
          console.log('[arcadecord.facade] finished running action animations')
        }
      },
      END_TURN_REPLAY(state) {
        state.game = store.state.game
        state.replaying = false
      },
      RUN_ACTION(state, action) {
        if (state.replaying) {
          console.log(
            '[arcadecord.facade] still replaying last turn! Not running action.'
          )
          return
        }
        runAction(state.game, action.type, action.data)
      },
      UPDATE_GAME(state, game) {
        store.commit('UPDATE_GAME', game)
      },
    },
  })

  // export default {
  //     debug: true,
  //     state: reactive({
  //         game: null,
  //         me: null,
  //         error: null,
  //         replaying: false,
  //         runningAction: false
  //     }),
  // };

  return facade
}
