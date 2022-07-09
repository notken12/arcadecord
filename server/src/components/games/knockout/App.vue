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
  background-color: #1b89e3;
  background-image: url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
