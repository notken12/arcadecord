<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { createVector } from '@app/js/games/8ball/utils';
import Common from '/gamecommons/8ball';

const props = defineProps({
  width: Number,
  height: Number,
  ballDisplayRadius: Number,
  renderer: Object,
  camera: {
    type: Object,
    required: true,
  },
  scale: Number,
});

const pockets = ref([]);

function updatePockets() {
  pockets.value = [];
  for (let pocket of Common.POCKETS) {
    let spos = createVector(
      pocket.x,
      0,
      pocket.z,
      props.camera,
      props.width * props.scale,
      props.height * props.scale
    );
    pockets.value.push({
      x: spos.x / props.scale,
      y: spos.y / props.scale,
    });
  }
}

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

onMounted(() => {
  window.addEventListener('resize', updatePockets);
  updatePockets();
});

onUnmounted(() => {
  window.removeEventListener('resize', updatePockets);
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

.pocket {
  width: 32px;
  height: 32px;
  position: absolute;
  transform: translate(-50%, -50%);
  background: #0044ff77;
  border-radius: 100%;
  background: rgb(51, 172, 255);
  background: radial-gradient(
    circle,
    rgba(51, 172, 255, 0.8606793059020483) 10%,
    rgba(17, 27, 207, 0) 85%
  );
  animation: pulse 1.5s infinite;
}

/* @keyframes pulse { */
/*   0% { */
/*     transform: translate(-50%, -50%) scale(1); */
/*   } */
/*   50% { */
/*     transform: translate(-50%, -50%) scale(1.5); */
/*   } */
/*   100% { */
/*     transform: translate(-50%, -50%) scale(1); */
/*   } */
/* } */

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* .container > div { */
/**/
/* } */
</style>
