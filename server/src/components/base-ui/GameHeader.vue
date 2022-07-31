<!--
  GameHeader.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="top">
    <div class="fabs">
      <button class="btn-fab" @click="openManual">
        <i class="material-icons">question_mark</i>
      </button>
      <Transition name="fade" appear mode="out-in">
        <div class="hint" v-if="isItMyTurn || game.hasEnded">{{ hint }}</div>
      </Transition>
      <button class="btn-fab" @click="openSettings">
        <i class="material-icons">settings</i>
      </button>
    </div>
    <players-view v-if="game.ready"></players-view>
  </div>
</template>

<script setup>
import bus from '@app/js/vue-event-bus.js';
import { useFacade } from './facade';
import PlayersView from './PlayersView.vue';
import { computed } from 'vue';
import GameFlow from '@app/js/GameFlow';

const { game, replaying } = useFacade();

defineProps({
  hint: String,
});

const isItMyTurn = computed(() => {
  return GameFlow.isItMyTurn(game.value) || replaying.value;
});

const openManual = () => {
  bus.emit('open-manual');
};
const openSettings = () => {
  bus.emit('open-settings');
};
</script>

<style lang="scss" scoped>
.hint {
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.top {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  pointer-events: none;
}

.top * {
  pointer-events: auto;
}
</style>
