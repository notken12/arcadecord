// 4inarow.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Import client-framework.js, which you need to connect to the server
import * as Client from '../client-framework.js'

// Nice UI components for the basic UI
import { GameView, createApp } from '../ui.js'

// Get game ID from URL address

var gameId = Client.utils.getGameId(window.location)

// Connect the socket to the server

Client.connect(gameId, connectionCallback)

function connectionCallback(response) {
  if (!response.game) return

  const App = {
    data() {
      return {
        game: response.game,
        me: response.discordUser,
      }
    },
    components: {
      GameView,
    },
    computed: {
      hint() {
        return ''
      },
    },
  }

  const app = createApp(App).mount('#app')
  window.app = app

  // Receive turn events whenever another player finishes their turn
  Client.socket.on('turn', (game, turn) => {
    // Update the game object
    Client.utils.updateGame(app.game, game)
  })
}
