<script setup>
// Import Vue components
// game-view, scores-view are automatically imported

// Import scss styles
// import 'scss/games/cuppong.scss'

import { replayAction } from '@app/js/client-framework.js'
import Common from '/gamecommons/cuppong'
import Side from './Side.vue'

import { Box, Camera, LambertMaterial, PointLight, Renderer, Scene, StandardMaterial, AmbientLight, GltfModel, Texture } from 'troisjs';
import { computed, onMounted, reactive, ref } from 'vue';

import { LinearFilter } from 'three'

let hint = computed(() => {
  return ''
})

const renderer = ref(null)
const camera = ref(null)
const table = ref(null)

function onTableLoad(model) {
  model.children[0].material.map.minFilter = LinearFilter
}

onMounted(() => {
  // let previousTime = new Date()
  // const d = 1
  // renderer.value.onBeforeRender(() => {
  //   const time = new Date()
  //   const elapsed = new Date() - previousTime
  //   previousTime = time
  // })
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
        :position="{ x: 0, y: 40, z: 0 }"
        class="canvas"
      >
        <Camera :position="{ z: 10 }" ref="camera" />
        <Scene background="#eeeeee">
          <AmbientLight color="#ffffff" :intensity="0.5" />
          <PointLight :position="{ y: 50, z: 50 }" />
          <GltfModel
            src="/assets/cuppong/table.glb"
            :scale="{ x: 100, y: 100, z: 100 }"
            :position="{ y: 0 }"
            ref="table"
            @load="onTableLoad"
          ></GltfModel>
          <Side v-for="side in game.data.sides" :side="side" />
        </Scene>
      </Renderer>
    </div>
  </game-view>
</template>

<style lang="scss">
.middle {
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>