<!--
  App.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <game-view>
    <scores-view>
      <template v-slot="scoreView">
        <div
          class="color-indicator"
          :class="{ yellow: game.data.colors[scoreView.playerindex] === 1 }"
        ></div>
      </template>
    </scores-view>

    <div class="middle">
      <Board></Board>
    </div>
  </game-view>
</template>

<script setup>
import Board from './Board.vue';

import { onMounted } from 'vue';
import { useFacade } from '@app/components/base-ui/facade';

const { $replayTurn, $endReplay } = useFacade();

onMounted(() => {
  $replayTurn(() => {
    $endReplay(300);
  });
});
</script>

<style lang="scss">
@use 'scss/base/_theme' as theme;

.color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin: 0 5px;
  display: inline-block;
  background-color: red;
  border: 2px black solid;
  box-shadow: theme.$md-elevation-level3;
}

.color-indicator.yellow {
  background-color: yellow;
  border-color: 2px black solid;
}

.middle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  overflow: visible;
}
</style>
<style lang="scss" src="scss/games/4inarow.scss"></style>

<!-- <style src="scss/games/chess.scss"></style> -->
