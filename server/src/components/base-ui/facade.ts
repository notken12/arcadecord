// facade.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { ref, computed, onMounted, onUnmounted, ComputedRef } from 'vue';
import Game from '../../games/Game';
import bus from '@app/js/vue-event-bus';
import { useStore } from 'vuex';

import { turnReplayDelay } from './replay-constants';
import { DiscordUser } from '@app/games/Player';

let replayTurnFunc = () => { };
let replayTurnFuncSet = false;

let replaySubscribed = false;

// by convention, composable function names start with "use"
export function useFacade() {
  const facade = useStore();

  const game: ComputedRef<Game> = computed(() => facade.state.game);
  // My discord user
  const me: ComputedRef<DiscordUser> = computed(() => facade.state.me);
  // Error with connecting to game
  const error = computed(() => facade.state.error);
  const replaying: ComputedRef<boolean> = computed(
    () => facade.state.replaying
  );
  const runningAction: ComputedRef<boolean> = computed(
    () => facade.state.runningAction
  );
  // Is socket connection contested: multiple players are connected, 1 free spot
  const contested = computed(() => facade.state.contested);

  const previousTurn = computed(() => {
    if (game.value) {
      if (game.value.turns.length > 0) {
        return game.value.turns[game.value.turns.length - 1];
      }
    }
    return null;
  });

  const $endReplay = (delayMS: number) => {
    if (delayMS == undefined) {
      delayMS = 0;
    }
    setTimeout(() => {
      facade.commit('END_TURN_REPLAY');
      console.log('[arcadecord.facade] finished replaying turn');
    }, delayMS);
  };

  const $replayTurn = (func?: () => any) => {
    if (typeof func === 'function') {
      replayTurnFunc = func;
      replayTurnFuncSet = true;
    }
    if (replaying.value && replayTurnFuncSet) {
      console.log('[arcadecord.facade] replaying turn');
      setTimeout(() => {
        window.requestAnimationFrame(replayTurnFunc);
      }, turnReplayDelay);
    }
  };

  onMounted(() => {
    // @ts-expect-error
    if (!replaySubscribed) bus.on('facade:replay-turn', $replayTurn);
    replaySubscribed = true;
  });

  onUnmounted(() => {
    // @ts-expect-error
    bus.off('facade:replay-turn', $replayTurn);
  });

  const $endAnimation = (delayMS: number) => {
    facade.commit('START_ACTION_ANIMATION');
    if (delayMS == undefined) {
      delayMS = 0;
    }
    setTimeout(() => {
      facade.commit('END_ACTION_ANIMATION');
    }, delayMS);
  };

  const $runAction = (actionType: string, actionData: Object) => {
    facade.commit('RUN_ACTION', {
      type: actionType,
      data: actionData,
    });
  };

  const $endTurn = () => {
    facade.commit('END_TURN');
  };

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
  };
}
