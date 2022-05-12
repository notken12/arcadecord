<!--
  Crosshair.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import gsap from 'gsap';
import { onMounted, ref, computed, watch } from 'vue';

const props = defineProps({
  target: {
    type: Object,
  },
  board: {
    type: Object,
    required: true,
  },
});

const el = ref(null);

const INITIAL_ANIMATION_DURATION = 0.2; // seconds
const NON_INTIAL_ANIMATION_DURATION = 0.1; // seconds

const updatePos = (initial) => {
  if (!props.target) {
    gsap.to(el.value, {
      opacity: 0,
      duration: 0.1,
    });
    return;
  }
  const x = `${props.target.col * 100}%`;
  const y = `${props.target.row * 100}%`;
  if (!initial) {
    gsap.to(el.value, {
      opacity: 1,
      x,
      y,
      duration: NON_INTIAL_ANIMATION_DURATION,
    });
  } else {
    gsap.fromTo(
      el.value,
      {
        x,
        y,
        opacity: 0,
        scale: 3.0,
      },
      {
        x,
        y,
        opacity: 1,
        scale: 1,
        duration: INITIAL_ANIMATION_DURATION,
        // ease: 'power1.in',
      }
    );
  }
};

const styles = computed(() => {
  return {
    width: `${(1 / props.board.width) * 100}%`,
    height: `${(1 / props.board.height) * 100}%`,
    pointerEvents: props.target ? 'auto' : 'none',
  };
});

watch(
  () => props.target,
  (_newValue, oldValue) => {
    updatePos(!oldValue);
  },
  { deep: true, flush: 'post' }
);

onMounted(() => {
  updatePos(true);
});
</script>

<template>
  <!-- <Transition name="target-fade"> -->
  <div class="target-crosshair" :style="styles" ref="el"></div>
  <!-- </Transition> -->
</template>

<style lang="scss" scoped>
.target-crosshair {
  position: absolute;
  top: 0;
  left: 0;
  background-image: url('/assets/seabattle/crosshair.svg');
  background-size: contain;
  opacity: 0;
}
</style>
