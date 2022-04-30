<!--
  App.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :hint="hint">
    <scores-view>
      <template v-slot="scoreView">
        <DummyIndicator :playerindex="scoreView.playerindex"></DummyIndicator>
      </template>
    </scores-view>

    <div class="middle">
      <game-canvas></game-canvas>
    </div>
  </game-view>
</template>

<script setup>
import { computed } from 'vue';
import 'scss/games/knockout.scss';
import GameCanvas from './GameCanvas.vue';
import DummyIndicator from './DummyIndicator.vue';

// import Common from '/gamecommons/knockout';

import { useFacade } from 'components/base-ui/facade';
import GameFlow from '@app/js/GameFlow';

const { $replayTurn, $endReplay, previousTurn, game } = useFacade();

const hint = computed(() => {
  if (GameFlow.isItMyTurn(game.value)) return 'Position your penguins.';
});
</script>

<style lang="scss">
.middle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#app {
  background: #1b89e3;
}
</style>
