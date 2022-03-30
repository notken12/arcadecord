// filler.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Import client-framework.js, which you need to connect to the server
import * as Client from '@app/js/client-framework.js'

// Use vue
import { createApp, replayTurn, setupUI } from '@app/js/ui.js'

import App from '@app/components/games/filler/App.vue'
import Loading from '@app/components/base-ui/Loading.vue'

import 'scss/games/filler.scss'

// Display a loading screen while we wait for the game to load
//const loading = createApp(Loading).mount('#loading');

// Get game ID from URL address

var gameId = Client.utils.getGameId(window.location)

// Connect the socket to the server

Client.connect(gameId, connectionCallback)

function connectionCallback(response) {
  if (!response.game) return

  // Nice UI components for the basic UI

  setupUI(response)

  const app = createApp(App).mount('#app')

  // Listen for events from the server
  Client.listen()

  window.app = app
}
