<script setup>
// Import Vue components
// game-view, scores-view are automatically imported

// Import scss styles
// import 'scss/games/cuppong.scss'

import { replayAction } from '@app/js/client-framework.js'
import Common from '/gamecommons/cuppong'
import Side from './Side.vue'

import { Box, Camera, LambertMaterial, PointLight, Renderer, Scene, StandardMaterial, AmbientLight, GltfModel, Texture, Sphere } from 'troisjs';
import { computed, onMounted, reactive, ref, getCurrentInstance, watch, watchEffect } from 'vue';

import { LinearFilter } from 'three'

import { useFacade } from 'components/base-ui/facade'

const { game, me, $replayTurn, $endReplay } = useFacade()

let hint = computed(() => {
  return ''
})

const sides = computed(() => game.value.data.sides)

const renderer = ref(null)
const camera = ref(null)
const table = ref(null)

function onTableLoad(model) {
  model.children[0].material.map.minFilter = LinearFilter
}

const mySide = computed(() => {
  let index = game.value.myIndex === -1 ? 1 : game.myIndex
  return game.value.data.sides[index]
})

const cameraRotation = computed(() => {
  let x = -Math.PI / 5
  let y = mySide.value.color === 'red' ? Math.PI / 2 : 0
  return {
    x,
    y,
    z: 0
  }
})

const cameraPosition = computed(() => {
  let x = 0
  let y = 70
  let z = mySide.value.color === 'red' ? -50 : 50
  return {
    x,
    y,
    z
  }
})

watchEffect(() => {
  if (!camera.value) return
  camera.value.camera.rotation.set(cameraRotation.value.x, cameraRotation.value.y, cameraRotation.value.z)
  camera.value.camera.position.set(cameraPosition.value.x, cameraPosition.value.y, cameraPosition.value.z)
})

onMounted(() => {
  // let previousTime = new Date()
  // const d = 1
  // renderer.value.onBeforeRender(() => {
  //   const time = new Date()
  //   const elapsed = new Date() - previousTime
  //   previousTime = time
  // })
  $replayTurn(() => {
    $endReplay()
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
      <Renderer ref="renderer" antialias resize class="canvas" :orbit-ctrl="false">
        <Camera ref="camera" />
        <Scene background="#eeeeee">
          <AmbientLight color="#ffffff" :intensity="0.5" />
          <PointLight :position="{ y: 50 }" />
          <Sphere :radius="2" :position="{ y: 2 }" />
          <GltfModel
            src="/assets/cuppong/table.glb"
            :scale="{ x: 100, y: 100, z: 100 }"
            :position="{ y: 0 }"
            ref="table"
            @load="onTableLoad"
          ></GltfModel>
          <Side v-for="side in sides" :side="side" />
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