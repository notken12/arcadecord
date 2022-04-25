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
  <game-view :game="game" :me="me" :hint="hint">
    <div class="middle"><game-canvas></game-canvas></div>
  </game-view>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import 'scss/games/knockout.scss';
import GameCanvas from './GameCanvas.vue';

import Common from '/gamecommons/knockout';

import { useFacade } from 'components/base-ui/facade';

const { $replayTurn, $endReplay, previousTurn } = useFacade();

const hint = computed(() => {
  return '';
});

onMounted(() => {
  $replayTurn(() => {
    for (let action of previousTurn.value.actions) {
      // TODO: implement replay
    }
    $endReplay(0);
  });
});
</script>
