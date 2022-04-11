// facade.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { ref, computed, onMounted, onUnmounted } from 'vue'
import bus from '@app/js/vue-event-bus'
import { useStore } from 'vuex'

import { turnReplayDelay } from './replay-constants'

let replayTurnFunc = () => {}
let replayTurnFuncSet = false

let replaySubscribed = false

// by convention, composable function names start with "use"
export function useFacade() {
  const facade = useStore()

  const game = computed(() => facade.state.game)
  // My discord user
  const me = computed(() => facade.state.me)
  // Error with connecting to game
  const error = computed(() => facade.state.error)
  const replaying = computed(() => facade.state.replaying)
  const runningAction = computed(() => facade.state.runningAction)
  // Is socket connection contested: multiple players are connected, 1 free spot
  const contested = computed(() => facade.state.contested)

  const previousTurn = computed(() => {
    if (game.value) {
      if (game.value.turns.length > 0) {
        return game.value.turns[game.value.turns.length - 1]
      }
    }
    return null
  })

  const $endReplay = (delayMS) => {
    if (delayMS == undefined) {
      delayMS = 0
    }
    setTimeout(() => {
      facade.commit('END_TURN_REPLAY')
      console.log('[arcadecord.facade] finished replaying turn')
    }, delayMS)
  }

  const $replayTurn = (func) => {
    if (typeof func === 'function') {
      replayTurnFunc = func
      replayTurnFuncSet = true
    }
    if (replaying.value && replayTurnFuncSet) {
      console.log('[arcadecord.facade] replaying turn')
      setTimeout(() => {
        window.requestAnimationFrame(replayTurnFunc)
      }, turnReplayDelay)
    }
  }

  onMounted(() => {
    if (!replaySubscribed) bus.on('facade:replay-turn', $replayTurn)
    replaySubscribed = true
  })

  onUnmounted(() => {
    bus.off('facade:replay-turn', $replayTurn)
  })

  const $endAnimation = (delayMS) => {
    facade.commit('START_ACTION_ANIMATION')
    if (delayMS == undefined) {
      delayMS = 0
    }
    setTimeout(() => {
      facade.commit('END_ACTION_ANIMATION')
    }, delayMS)
  }

  const $runAction = (actionType, actionData) => {
    facade.commit('RUN_ACTION', {
      type: actionType,
      data: actionData,
    })
  }

  const $endTurn = () => {
    facade.commit('END_TURN')
  }

  return {
    game,
    me,
    error,
    replaying,
    runningAction,
    previousTurn,
    contested,
    $endReplay,
    $replayTurn,
    $endAnimation,
    $runAction,
    $endTurn,
  }
}
