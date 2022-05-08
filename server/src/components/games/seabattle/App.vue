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
        <hit-board-view
          class="board replay-board"
          :target="targetedCell"
          :game="game"
          :board="otherHitBoard"
        >
        </hit-board-view>
      </div>
      <div>
        <ship-placer
          :board="shipPlacementBoard"
          :game="game"
          v-if="!game.data.placed[myHitBoard.playerIndex] && shipPlacementBoard"
        ></ship-placer>
        <hit-board-view
          class="board"
          :board="myHitBoard"
          :target="targetedCell"
          :game="game"
          v-else
        ></hit-board-view>
      </div>
    </div>

    <div class="bottom">
      <button
        @click="placeShips"
        v-if="!game.data.placed[game.myIndex] && isItMyTurn"
      >
        Shuffle
      </button>
      <button
        @click="setShips"
        v-if="!game.data.placed[game.myIndex] && isItMyTurn"
      >
        Done
      </button>
      <button
        @click="shoot"
        v-if="game.data.placed[game.myIndex] && targetedCell"
      >
        Fire!
      </button>
    </div>

    <div id="game-canvas"></div>
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

let availableShips

const styles = computed(() => {
  if (replaying.value) {
    let transform = 'translateX(-100%)';
  } else {
    let transform = 'translateX(0%)';
  }

  return {
    transform,
  };
});

const replayStyles = computed(() => {
  let transform
  if (replaying.value) {
    transform = 'translateX(0%)';
  } else {
    transform = 'translateX(-50%)';
  }

  return {
    transform,
  };
});

const hint = computed(() => {
  if (replaying.value) return
  if (!game.value.data.placed[game.value.myIndex]) {
    return 'Place your ships!';
  } else {
    return 'Tap on a tile to fire';
  }
});

const isItMyTurn = computed(() => GameFlow.isItMyTurn(game.value));

const myIndex = computed(() => {
  return game.value.myIndex === -1 ? 1 : game.value.myIndex;
});

const myHitBoard = computed(() => {
  return game.value.data.hitBoards[myIndex.value];
});

const otherHitBoard = computed(() => {
  return game.value.data.hitBoards[[1, 0][myIndex.value]];
});

watch(replaying, () => {
  if (!game.value.data.placed[myIndex.value] && isItMyTurn.value) placeShips();
});

const targetedCell = ref(null);

const setShips = () => {
  $runAction('placeShips', {
    shipPlacementBoard: shipPlacementBoard.value,
  });
  $endAnimation(500);
};

const shipPlacementBoard = ref(null)

const placeShips = () => {
  console.log('placing ships');
  let t1 = performance.now();
  shipPlacementBoard.value = Common.PlaceShips(
    cloneDeep(availableShips),
    new Common.ShipPlacementBoard(
      myHitBoard.value.width,
      myHitBoard.value.height
    )
  );
  let t2 = performance.now();
  console.log('Placing ships took ' + Math.round(t2 - t1) + ' milliseconds.');
};

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

  availableShips = Common.getAvailableShips(myHitBoard.value.playerIndex);

  if (
    !game.value.data.placed[myHitBoard.value.playerIndex] &&
    isItMyTurn.value
  ) {
    placeShips();
  }

  $replayTurn(async () => {
    for (let action of previousTurn.value.actions) {
      replayAction(game.value, action);
      await utils.wait(300);
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
}
</style>
