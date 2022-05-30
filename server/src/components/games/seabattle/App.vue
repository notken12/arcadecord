<!--
  App.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <game-view :game="game" :me="me" :hint="hint">
    <div class="middle" :style="replayStyles">
      <div>
        <hit-board-view :target="targetedCell" :board="otherHitBoard">
        </hit-board-view>
      </div>
      <div>
        <ship-placer
          :board="shipPlacementBoard"
          v-if="!game.data.placed[myIndex] && shipPlacementBoard"
        >
        </ship-placer>
        <hit-board-view
          :board="myHitBoard"
          :target="targetedCell"
          v-if="game.data.placed[myIndex]"
        ></hit-board-view>
      </div>
    </div>

    <div class="bottom" :class="{ hidden: replaying }">
      <div v-if="!game.data.placed[game.myIndex]" class="bottom-section">
        <button @click="placeShips">Shuffle</button>
        <button @click="setShips">Done</button>
      </div>
      <div v-else class="bottom-section">
        <button @click="shoot" :class="{ hidden: !targetedCell }">Fire!</button>
      </div>
    </div>
  </game-view>
</template>

<script setup>
import '@app/scss/games/seabattle.scss';

import Common from '/gamecommons/seabattle';
import ShipPlacer from './ShipPlacer.vue';
import HitBoardView from './HitBoardView.vue';
import cloneDeep from 'lodash.clonedeep';
import { runAction, utils as clientUtils } from '@app/js/client-framework.js';
import GameFlow from '@app/js/GameFlow.js';
import bus from '@app/js/vue-event-bus';
import { useFacade } from '@app/components/base-ui/facade';
import { ref, computed, onMounted, watch } from 'vue';
import { replayAction, utils } from '@app/js/client-framework';

const {
  game,
  me,
  replaying,
  $replayTurn,
  $endReplay,
  previousTurn,
  $runAction,
  $endAnimation,
} = useFacade();

const hint = computed(() => {
  if (replaying.value) return;
  if (!game.value.data.placed[game.value.myIndex]) {
    return 'Place your ships!';
  } else {
    return 'Tap on a tile to fire';
  }
});

const isItMyTurn = computed(() => {
  return GameFlow.isItMyTurn(game.value);
});

const myIndex = computed(() => {
  return game.value.myIndex === -1 ? 1 : game.value.myIndex;
});

const opponentIndex = computed(() => {
  return myIndex === 1 ? 0 : 1;
});

const replayStyles = computed(() => {
  let transform;
  if (replaying.value && game.value.data.placed[myIndex.value]) {
    transform = 'translateX(0%)';
  } else {
    transform = 'translateX(-50%)';
  }

  return {
    transform,
  };
});

const myHitBoard = computed(() => {
  return game.value.data.hitBoards[myIndex.value];
});

const otherHitBoard = computed(() => {
  return game.value.data.hitBoards[opponentIndex.value];
});

watch(replaying, () => {
  if (!game.value.data.placed[myIndex.value] && isItMyTurn.value) placeShips();
});

const targetedCell = ref(null);

const setShips = () => {
  $runAction('placeShips', {
    shipPlacementBoard: cloneDeep(shipPlacementBoard.value),
  });
  $endAnimation(500);
};

const shipPlacementBoard = ref(null);

const availableShips = Common.getAvailableShips(myHitBoard.value.playerIndex);

const placeShips = () => {
  // console.log('placing ships');
  let t1 = performance.now();
  shipPlacementBoard.value = Common.PlaceShips(
    cloneDeep(availableShips),
    new Common.ShipPlacementBoard(
      myHitBoard.value.width,
      myHitBoard.value.height
    )
  );
  let t2 = performance.now();
  // console.log('Placing ships took ' + Math.round(t2 - t1) + ' milliseconds.');
};

if (!game.value.data.placed[myHitBoard.value.playerIndex] && isItMyTurn.value) {
  placeShips();
}

const shoot = () => {
  if (targetedCell.value) {
    let { row, col } = targetedCell.value;
    $runAction('shoot', { row, col });
    targetedCell.value = null;
    $endAnimation(1500);
  }
};

onMounted(() => {
  bus.on('changeCellect', (cell) => {
    targetedCell.value = cell;
  });

  $replayTurn(async () => {
    if (
      previousTurn.value.actions.length === 1 &&
      previousTurn.value.actions[0].type === 'placeShips'
    ) {
      $endReplay(0);
      return;
    }
    for (let action of previousTurn.value.actions) {
      if (action.type === 'shoot') {
        await utils.wait(200);
        targetedCell.value = {
          row: action.data.row,
          col: action.data.col,
        };
        await utils.wait(300);
        targetedCell.value = null;
        await utils.wait(100);
        replayAction(game.value, action);
      } else {
        replayAction(game.value, action);
      }
    }
    $endReplay(500);
  });
});
</script>
<style lang="scss">
.middle {
  display: flex;
  flex-direction: row;
  width: 200%;
  max-width: 200%;
  transition: transform 0.3s ease;
}

.middle > div {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 500px;
}

.hidden {
  opacity: 0;
}

.bottom-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  gap: 16px;
}
</style>
