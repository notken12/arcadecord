<!--
  DummyIndicator.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { computed } from 'vue';

const props = defineProps({
  playerindex: Number,
});

// 0: black, 1: blue
const url = computed(() => {
  if (props.playerindex === 0) {
    return '/assets/knockout/blackpenguin.svg';
  }
  return '/assets/knockout/bluepenguin.svg';
});

const alt = computed(() => {
  if (props.playerindex === 0) {
    return 'Black penguin';
  }
  return 'Blue penguin';
});
</script>

<template>
  <img :src="url" :alt="alt" class="penguin" />
</template>

<style lang="scss" scoped>
$size: 32px;

.penguin {
  width: $size;
  height: $size;
  filter: drop-shadow(2px, 2px, 2px, black);
}
</style>
