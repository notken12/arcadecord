<script setup>
import gsap from 'gsap';
import { onMounted, ref, computed, watch } from 'vue';

const props = defineProps({
  target: {
    type: Object,
    required: true,
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
  const x = `${props.target.col * 100}%`;
  const y = `${props.target.row * 100}%`;
  if (!initial) {
    gsap.to(el.value, {
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
  };
});

watch(
  () => [props.target.col, props.target.row],
  () => {
    updatePos(false);
  }
);

onMounted(() => {
  updatePos(true);
});
</script>

<template>
  <div class="target-crosshair" :style="styles" ref="el"></div>
</template>

<style lang="scss" scoped>
.target-crosshair {
  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 0.2s;
  background-image: url('/assets/seabattle/crosshair.svg');
  background-size: contain;
}
</style>
