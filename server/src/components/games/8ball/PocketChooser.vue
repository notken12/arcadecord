<script setup>
import { computed } from 'vue';

const props = defineProps({
  width: Number,
  height: Number,
  ballDisplayRadius: Number,
  renderer: Object,
  camera: Object,
});

const pockets = [];

const getPocketStyles = (p) => {
  return {
    left: `${p.x}px`,
    top: `${p.y}px`,
  };
};

const styles = computed(() => {
  return {
    width: `${props.width}px`,
    height: `${props.height}px`,
  };
});
</script>

<template>
  <div class="container" :style="styles">
    <!-- <div> -->
    <h1>Choose a pocket</h1>
    <div
      class="pocket"
      v-for="pocket in pockets"
      :style="getPocketStyles(pocket)"
    ></div>
    <!-- </div> -->
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  position: absolute;
  z-index: 11;
  justify-content: center;
  align-items: center;
}

h1 {
  font-size: 120%;
  text-shadow: 1px 1px 0px #000000, -1px -1px 0px #000000, -1px 1px 0px #000000,
    1px -1px 0px #000000;
}

/* .container > div { */
/**/
/* } */
</style>
