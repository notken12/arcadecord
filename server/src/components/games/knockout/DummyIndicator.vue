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
  <img :src="url" :alt="alt" />
</template>

<style lang="scss" scoped>
$size: 32px;

img {
  width: $size;
  height: $size;
}
</style>
