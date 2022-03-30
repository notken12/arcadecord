import * as Client from '../client-framework.js'

// base ui vue components
import { GameView, createApp } from '../ui.js'

import Common from '/gamecommons/seabattle'

import bus from '../vue-event-bus.js'

// import vue components
import App from 'components/games/seabattle/App.vue'

import cloneDeep from 'lodash.clonedeep'
import { reactive } from 'vue'

function connectionCallback(response) {
  var game = response.game
  window.game = game

  var discordUser = response.discordUser
  window.discordUser = discordUser

  document.addEventListener('mouseup', function () {
    bus.mouseIsDown = false
  })

  document.addEventListener('mousedown', function () {
    bus.mouseIsDown = true
  })

  var vm = createApp(App, {
    game: reactive(game),
    me: reactive(discordUser),
  })

  var app = vm.mount('#app')
  window.app = app

  Client.socket.on('turn', (g, turn) => {
    Client.utils.updateGame(app.game, g)
  })
}

var gameId = window.location.pathname.split('/')[2]

Client.connect(gameId, connectionCallback)
