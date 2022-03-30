import { reactive, ref } from 'vue'
import { utils } from '@app/js/client-framework.js'
import { createStore as createVuexStore } from 'vuex'

export { createStore }

function createStore() {
  const store = createVuexStore({
    state() {
      return {
        game: null,
        me: null,
        error: null,
        user: null,
      }
    },
    mutations: {
      UPDATE_GAME(state, game) {
        utils.updateGame(state.game, game)
      },
      SETUP(state, connectionResponse) {
        state.game = connectionResponse.game ?? null
        state.me = connectionResponse.discordUser ?? null
        state.error = connectionResponse.error ?? null
        state.user = connectionResponse.user ?? null
      },
      UPDATE_SETTINGS(state, settings) {
        if (!state.user.settings) {
          state.user.settings = {}
        }
        Object.assign(state.user.settings, settings)
      },
    },
  })
  return store
}
