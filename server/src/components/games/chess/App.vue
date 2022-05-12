<!--
  App.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <game-view :game="game" :me="me" :hint="hint">
    <scores-view>
      <template v-slot="scoreView">
        <div
          class="color-indicator"
          :class="{ black: game.data.colors[scoreView.playerindex] === 1 }"
        ></div>
      </template>
    </scores-view>

    <div class="middle">
      <board></board>
    </div>
  </game-view>
</template>

<script setup>
import Board from './Board.vue';
import bus from '@app/js/vue-event-bus';

import Common from '/gamecommons/chess';
import { replayAction } from '@app/js/client-framework';
import { useFacade } from '@app/components/base-ui/facade';
import { ref, computed, onMounted } from 'vue';

const { game, $replayTurn, $endReplay, previousTurn } = useFacade();

const selectedPiece = ref(null);

const hint = computed(() => {
  if (selectedPiece.value) return 'Tap a square to move to';
  else return 'Tap a piece to select it';
});

const board = computed(() => {
  return game.value.data.board;
});

const myColor = computed(() => {
  let index = this.game.myIndex === -1 ? 1 : this.game.myIndex;
  return this.game.data.colors[index];
});

onMounted(() => {
  $replayTurn(() => {
    replayAction(game.value, previousTurn.value.actions[0]);
    $endReplay(1000);
  });

  bus.on('piece-selected', (piece) => {
    selectedPiece.value = piece;
  });
});
</script>

<style lang="scss">
@use 'scss/base/_theme' as theme;
@use 'scss/games/chess.scss';

.color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin: 0 5px;
  display: inline-block;
  background-color: #fff;
  border: 2px black solid;
  box-shadow: theme.$md-elevation-level3;
}

.color-indicator.black {
  background-color: #000;
  border-color: white;
}
</style>

<!-- <style src="scss/games/chess.scss"></style> -->
