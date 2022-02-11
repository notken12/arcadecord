<script setup>
// Import Vue components
// game-view, scores-view are automatically imported

// Import scss styles
// import 'scss/games/cuppong.scss'

import { replayAction } from '@app/js/client-framework.js'
import Common from '/gamecommons/cuppong'

import { Box, Camera, LambertMaterial, PointLight, Renderer, Scene, StandardMaterial, AmbientLight } from 'troisjs';
import { computed, onMounted, reactive, ref } from 'vue';

let hint = computed(() => {
  return ''
})

const renderer = ref(null)
const cube = ref(null)

const rotation = reactive({
  x: 0,
  y: 0,
  z: 0
})

onMounted(() => {
  let previousTime = new Date()
  const d = 1
  renderer.value.onBeforeRender(() => {
    const time = new Date()
    const elapsed = new Date() - previousTime
    previousTime = time
    rotation.x += d * elapsed / 1000
    rotation.y += d * elapsed / 1000
    rotation.z += d * elapsed / 1000
  })
})
</script>

<template>
  <!-- GameView component, contains all basic game UI 
  like settings button-->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <div class="middle">
      <!-- Game UI just for filler -->
        <Renderer
          ref="renderer"
          antialias
          resize
          :orbit-ctrl="{ enableDamping: true, dampingFactor: 0.05 }"
          class="canvas"
        >
          <Camera :position="{ z: 10 }" />
          <Scene background="#eeeeee">
            <AmbientLight color="#ffffff" :intensity="0.5" />
            <PointLight :position="{ y: 50, z: 50 }" />
            <Box ref="cube" :rotation="rotation">
              <LambertMaterial />
            </Box>
            <Box :width="100" :depth="200" :height="2" :position="{ y: -10 }">
              <StandardMaterial color="#116611" />
            </Box>
          </Scene>
        </Renderer>
    </div>
  </game-view>
</template>

<style lang="scss">
.canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  top: 0;
  left: 0;
}
</style>