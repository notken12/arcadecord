// store.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

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
        contested: false,
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
        state.contested = connectionResponse.contested ?? false
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
