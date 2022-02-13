<script setup>
// Import Vue components
// game-view, scores-view are automatically imported

// Import scss styles
// import 'scss/games/cuppong.scss'

import { replayAction } from '@app/js/client-framework.js'
import Common from '/gamecommons/cuppong'
import Side from './Side.vue'

import { computed, onMounted, reactive, ref, getCurrentInstance, watch, watchEffect } from 'vue';

import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { useFacade } from 'components/base-ui/facade'
import gsap from 'gsap'

import { getCupPosition } from '@app/js/games/cuppong/Cup'

const { game, me, $replayTurn, $endReplay } = useFacade()

let hint = computed(() => {
  return ''
})

const sides = computed(() => game.value.data.sides)

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
  let z = mySide.value.color === 'red' ? -40 : 40
  return {
    x,
    y,
    z
  }
})

const canvasWrapper = ref(null)

let scene, camera, renderer, tableObject, ballObject

const cupObjects = []

const canvas = ref(null)

const initThree = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  camera = new THREE.PerspectiveCamera(75, canvasWrapper.value.clientWidth / canvasWrapper.value.clientHeight, 0.1, 1000)

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(canvasWrapper.value.clientWidth, canvasWrapper.value.clientHeight)

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  // load table model
  const loader = new GLTFLoader()
  loader.load('/assets/cuppong/table.glb', (gltf) => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.map.minFilter = THREE.LinearFilter
        child.scale.multiplyScalar(100)
        scene.add(child)

        tableObject = child
      }
    })
  })

  // load cup model
  loader.load('/assets/cuppong/red_cup.glb', (gltf) => {
    gltf.scene.scale.multiplyScalar(100)
    let sideCups = sides.value[0].cups
    for (let cup of sideCups) {
      let cupObject = gltf.scene.clone()
      scene.add(cupObject)
      cupObjects.push(cupObject)

      watch(cup, () => {
        let position = getCupPosition(cup)
        cupObject.position.set(position.x, position.y, position.z)
      }, { immediate: true })
    }
  })

  loader.load('/assets/cuppong/blue_cup.glb', (gltf) => {
    gltf.scene.scale.multiplyScalar(100)
    let sideCups = sides.value[1].cups
    for (let cup of sideCups) {
      let cupObject = gltf.scene.clone()
      scene.add(cupObject)
      cupObjects.push(cupObject)

      watch(cup, () => {
        let position = getCupPosition(cup)
        cupObject.position.set(position.x, position.y, position.z)
      }, { immediate: true })
    }
  })

// add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

// add point light
const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.set(0, 50, 0)
scene.add(pointLight)

// add ball
ballObject = new THREE.Mesh(
  new THREE.SphereGeometry(2, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
)
scene.add(ballObject)
}

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

  initThree()

  watchEffect(() => {
    camera.position.set(cameraPosition.value.x, cameraPosition.value.y, cameraPosition.value.z)
    camera.rotation.set(cameraRotation.value.x, cameraRotation.value.y, cameraRotation.value.z)
  })

  window.addEventListener('resize', () => {
    camera.aspect = canvasWrapper.value.offsetWidth / canvasWrapper.value.offsetHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvasWrapper.value.offsetWidth, canvasWrapper.value.offsetHeight)
  })
})
</script>

<template>
  <!-- GameView component, contains all basic game UI 
  like settings button-->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <div class="middle" ref="canvasWrapper">
      <!-- Game UI just for filler -->
      <!-- <Renderer ref="renderer" antialias resize class="canvas" :orbit-ctrl="false">
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
      </Renderer>-->
      <canvas id="game-canvas" ref="canvas"></canvas>
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