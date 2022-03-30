// example.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Import client-framework.js, which you need to connect to the server
import * as Client from '../client-framework.js'

// Nice UI components for the basic UI: help, settings, etc.
import { GameView, createApp } from '../ui.js'

// Import Vue.js
import * as Vue from 'vue'

// Get game ID from URL address

var gameId = Client.utils.getGameId(window.location)

// Connect the socket to the server

Client.connect(gameId, connectionCallback)

// On connection, create the UI
function connectionCallback(response) {
  if (!response.game) return

  const App = {
    data() {
      return {
        game: response.game,
        me: response.discordUser,
        question: '',
      }
    },
    computed: {
      myScore() {
        // Get the score of the player
        return this.game.data.scores[this.game.myIndex] || 0
      },
      opponentName() {
        // Get the opponent's name or undefined
        // if the user is the only one in the game
        var opponentIndex = this.game.myIndex === 0 ? 1 : 0

        if (this.game.players[opponentIndex])
          return this.game.players[opponentIndex].discordUser.tag

        return undefined
      },
      opponentScore() {
        // Get the opponent's score
        var opponentIndex = this.game.myIndex === 0 ? 1 : 0
        return this.game.data.scores[opponentIndex]
      },
      myAnswer() {
        // Get the answer of the player
        return this.game.data.answers[this.game.myIndex]
      },
      hint() {
        // if the question doesn't contain a question mark, it's not a question
        if (!this.question.includes('?') && this.question.length > 0) {
          return 'Questions usually contain a question mark 🥴'
        }

        return ''
      },
    },
    methods: {
      boop() {
        // Run action 'boop'
        Client.runAction(this.game, 'boop', {})
      },
      endTurn() {
        // Run action 'end_turn'
        Client.runAction(this.game, 'end_turn', {})

        // Issue with how the UI is updated, so we need to manually update the UI
        // I think the problem is that game.endTurn() changes the game object from inside itself instead of using the proxy so Vue doesn't know about it
      },
      ask() {
        // Run action 'ask'
        // This will need server-side handling,
        // so we have a callback to handle the response
        Client.runAction(
          this.game,
          'ask',
          { question: this.question },
          (response) => {
            console.log(response)
            if (response.game) {
              // Update the game data to the new game state after this action
              Client.utils.updateGame(this.game, response.game)
            }
          }
        )
      },
    },
    components: {
      GameView, // game view component from ui.js, will provide default ui for settings, help, etc.
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
