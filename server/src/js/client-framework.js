// client-framework.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import cloneDeep from 'lodash.clonedeep'
import GameFlow from './GameFlow.js'
import bus from './vue-event-bus.js'
import { replayTurn } from './ui.js'
import { io } from 'socket.io-client'

import { ApplicationInsights } from '@microsoft/applicationinsights-web'

const appInsights = new ApplicationInsights({
  config: {
    connectionString:
      'InstrumentationKey=54ef4b41-2e52-4be2-bf3f-02471829b486;IngestionEndpoint=https://eastus-1.in.applicationinsights.azure.com/',
    /* ...Other Configuration Options... */
  },
})
appInsights.loadAppInsights()
appInsights.trackPageView()

function log(...args) {
  if (import.meta.env.MODE === 'development') {
    console.log(...args)
  }
}

var socket

let onPageHasUnsavedChanges, onAllChangesSaved

async function useOnClient() {
  console.log(`[arcadecord] running in ${import.meta.env.MODE} mode`)

  socket = io(`${window.location.origin}`)

  const beforeUnloadListener = (event) => {
    event.preventDefault()
    return (event.returnValue =
      'Your turn has not been sent yet. Are you sure you want to leave?')
  }

  // A function that invokes a callback when the page has unsaved changes.
  onPageHasUnsavedChanges = () => {
    window.addEventListener('beforeunload', beforeUnloadListener, {
      capture: true,
    })
  }

  // A function that invokes a callback when the page's unsaved changes are resolved.
  onAllChangesSaved = () => {
    window.removeEventListener('beforeunload', beforeUnloadListener, {
      capture: true,
    })
  }
}

class Action {
  constructor(type, data, playerIndex) {
    this.type = type
    this.data = data
    this.playerIndex = playerIndex
  }
}

const client = {
  eventHandlers: {},
  emit: function (event, ...args) {
    if (!this.eventHandlers[event]) return

    for (let callback of this.eventHandlers[event]) {
      callback(...args)
    }
  },
  on: function (event, callback) {
    if (!this.eventHandlers[event]) this.eventHandlers[event] = []
    this.eventHandlers[event].push(callback)
  },
}

const utils = {
  getGameId: function (location) {
    return location.pathname.split('/')[2]
  },
  propertiesToIgnore: ['client', 'actionModels'],
  functionsToApplyToGame: {
    isItUsersTurn(a, i) {
      console.warn(
        'game.isItUsersTurn is deprecated. Use GameFlow.isItUsersTurn(game, index) instead.'
      )
      return (
        this.turn == i || (!this.hasStarted && !this.isGameFull() && i == -1)
      )
    },
    isItMyTurn() {
      console.warn(
        'game.isItMyTurn is deprecated. Use GameFlow.isItMyTurn(game) instead.'
      )
      return !this.hasEnded && this.isItUsersTurn(undefined, this.myIndex)
    },
    isGameFull() {
      console.warn(
        'game.isGameFull is deprecated. Use GameFlow.isGameFull(game) instead.'
      )
      return this.players.length >= this.maxPlayers
    },
  },

  async setUpGame(game) {
    let { default: Common } = await import(
      `../games/types/${game.typeId}/common.js`
    )

    game.client = client

    for (let key in game.actionModels) {
      game.actionModels[key] = Common[game.actionModels[key]]
    }

    for (let key in game.clientActionModels) {
      game.clientActionModels[key] = Common[game.clientActionModels[key]]
    }

    for (let key in this.functionsToApplyToGame) {
      game[key] = this.functionsToApplyToGame[key].bind(game)
    }

    return game
  },
  updateGame(game, g) {
    // write up-to-date data into game
    for (let prop in g) {
      if (utils.propertiesToIgnore.includes(prop)) {
        continue
      }
      game[prop] = g[prop]
    }
  },
}

var actionEmissionQueue = []

let sending = false

function emitAction(game, actionType, actionData, actionCallback) {
  sending = true
  onPageHasUnsavedChanges()
  bus.emit('sending', true)
  actionEmissionQueue.push([actionType, actionData])

  var firstActionEmitted = false

  function callback(...args) {
    if (actionEmissionQueue.length > 0) {
      var action = actionEmissionQueue.shift()
      socket.emit('action', action[0], action[1], callback)
    } else {
      sending = false
      onAllChangesSaved()
      bus.emit('sending', false)
      log('[arcadecord] all actions emitted')
    }
    if (firstActionEmitted) {
      if (typeof actionCallback === 'function') actionCallback(...args)
    }
    firstActionEmitted = true
  }

  if (actionEmissionQueue.length === 1) {
    // start the chain
    callback()
  }
}

var discordUser

function runAction(game, type, data, callback, clone) {
  var game = simulateAction(game, type, data, game.myIndex, false, clone)
  emitAction(game, type, data, callback)
  return game
}

function replayAction(game, action, clone) {
  let { type, data, playerIndex } = action
  var game = simulateAction(game, type, data, playerIndex, true, clone)
  return game
}

function simulateAction(
  game,
  type,
  data,
  playerIndex,
  disableTurnCheck,
  clone
) {
  var game = clone ? cloneDeep(game) : game

  if (
    (game.hasEnded || !GameFlow.isItUsersTurn(game, playerIndex)) &&
    !disableTurnCheck
  ) {
    return false
  }

  if (playerIndex == -1) {
    // same code as in handleAction in Game.js: if game hasn't started, start game with this action
    if (game.hasStarted == false) {
      // game.players.push({ discordUser: discordUser })
      playerIndex = game.players.length
      game.myIndex = playerIndex

      GameFlow.start(game)
    }
  }

  if (!game.actionModels[type]) {
    console.error(
      `There's no action model for type "${type}". Try:\n - Checking if you misspelled the action type.\n - Checking if you're missing an action model for this game. If so, you'll need to write one!\nRemember that common action models need to be functions from common.js`
    )
    return false
  }

  var success = game.actionModels[type](
    game,
    new Action(type, data, playerIndex)
  )
  if (!success) {
    return false
  }

  if (game.clientActionModels[type]) {
    var success = game.clientActionModels[type](
      game,
      new Action(type, data, playerIndex)
    )

    if (!success) return false
  }

  return game
}

async function updateSettings(newSettings) {
  return new Promise((resolve, reject) => {
    socket.emit('settings:update', newSettings, () => {
      log('[arcadecord] updated settings!')
      resolve()
    })
  })
}

async function resendInvite() {
  return new Promise((resolve, reject) => {
    socket.emit('resend invite', () => {
      console.log('[arcadecord] resent invite!')
      resolve()
    })
  })
}

async function connect(gameId, callback) {
  let baseCallback = async (response) => {
    if (response.status != 'success') {
      log(`[arcadecord] connection failed with error ${response.error}`)

      callback({
        status: response.status,
        error: response.error,
      })
      return
    }

    let { discordUser, user, game } = response

    game = await utils.setUpGame(game)

    callback({
      status: response.status,
      game,
      user,
      discordUser,
    })
  }

  socket.emit(
    'connect_socket',
    {
      gameId: gameId,
    },
    baseCallback
  )

  function reconnect() {
    if (!socket.connected && !intentionalDisconnect) {
      log('[arcadecord.socket] disconnected. reconnecting...')
      socket = socket.connect()
      socket.emit(
        'connect_socket',
        {
          gameId: gameId,
        },
        () => {
          setTimeout(baseCallback, 1000)
        }
      )
    }
  }

  let intentionalDisconnect = false

  socket.on('disconnect', async (reason) => {
    log('[arcadecord.socket] disconnected from server with reason: ' + reason)
    if (
      reason !== 'io server disconnect' &&
      reason !== 'io client disconnect'
    ) {
      // Reconnect
      reconnect()
    } else {
      // If the disconnect was intentional, don't reconnect
      intentionalDisconnect = true
    }
  })

  window.addEventListener('focus', () => {
    reconnect()
  })

  window.addEventListener('blur', () => {
    reconnect()
  })

  window.setInterval(() => {
    reconnect()
  }, 3000)
}

function listen() {
  // Receive turn events whenever another player finishes their turn
  socket.on('turn', (game, turn) => {
    // Update the game UI
    store.commit('UPDATE_GAME', game)
    // Replay the turn
    replayTurn()

    log('[arcadecord.socket] turn received, now the turn is ' + game.turn)
  })
}

export {
  socket,
  utils,
  emitAction,
  runAction,
  simulateAction,
  replayAction,
  connect,
  sending,
  appInsights,
  listen,
  useOnClient,
  updateSettings,
  resendInvite,
}
