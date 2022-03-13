import { ref, computed, onMounted } from 'vue'
import bus from '@app/js/vue-event-bus'
import { useStore } from 'vuex'

const turnReplayDelay = 250

let replayTurnFunc = () => {}
let replayTurnFuncSet = false

// by convention, composable function names start with "use"
export function useFacade() {
  const facade = useStore()

  const game = computed(() => facade.state.game)
  const me = computed(() => facade.state.me)
  const error = computed(() => facade.state.error)
  const replaying = computed(() => facade.state.replaying)
  const runningAction = computed(() => facade.state.runningAction)

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
  bus.on('facade:replay-turn', $replayTurn)

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
    $endReplay,
    $replayTurn,
    $endAnimation,
    $runAction,
    $endTurn,
  }
}
