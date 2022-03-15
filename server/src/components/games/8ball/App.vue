<script setup>
import { useFacade } from 'components/base-ui/facade'
import { computed, ref, onMounted } from 'vue'

import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import * as CANNON from 'cannon-es'

import { Ball } from '@app/js/games/8ball/Ball'
import { Table } from '@app/js/games/8ball/Table'
import { getBalls } from '@app/js/games/8ball/utils'

const {
  game,
  me,
  replaying,
  runningAction,
  $replayTurn,
  $endReplay,
  $runAction,
  $endAnimation,
} = useFacade()

let hint = computed(() => {
  return ''
})

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
})

const canvas = ref(null)
const canvasWrapper = ref(null)

let orbitControlsEnabled = true
let scene, camera, orbitControls, renderer, tableSurfaceBody, table, balls

const fps = ref(0)

const initThree = async () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xeeeeee)
  camera = new THREE.PerspectiveCamera(
    75,
    canvas.value.offsetWidth / canvasWrapper.value.offsetHeight,
    0.1,
    1000
  )

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true })
  /* renderer.shadowMap.enabled = true */
  /* renderer.shadowMap.type = THREE.PCFSoftShadowMap // default THREE.PCFShadowMap */
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(
    canvasWrapper.value.offsetWidth,
    canvasWrapper.value.offsetHeight
  )

  camera.position.set(0, 3, 0)
  camera.rotation.set(Math.PI, 0, 0)

  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
  scene.add(light)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  table = new Table(scene, world)

  balls = getBalls(scene, world)

  if (orbitControlsEnabled) {
    orbitControls = new OrbitControls(camera, renderer.domElement)
    orbitControls.enableDamping = true
    orbitControls.dampingFactor = 0.25
  }

  window.scene = scene
  window.camera = camera
  window.world = world

  let time = new Date().getTime()

  let frames = 0
  balls[0].body.applyForce(
    new CANNON.Vec3(0, 0, 30),
    balls[0].body.position
  )
  function animate() {
    requestAnimationFrame(animate)

    let deltaTime = (new Date().getTime() - time) / 1000
    time = new Date().getTime()

    frames++

    if (table.surfaceBody) {
      world.fixedStep()

      for (let i = 0; i < balls.length; i++) {
        balls[i].update()
      }
    }

    if (orbitControls) {
      orbitControls.update()
    }

    // cannonDebugger.update() // Update the CannonDebugger meshes

    // Render THREE.js
    renderer.render(scene, camera)
  }
  animate()

  setInterval(() => {
    fps.value = frames
    frames = 0
  }, 1000)
}

onMounted(async () => {
  await initThree()

  function resize() {
    if (canvasWrapper.value) {
      camera.aspect =
        canvasWrapper.value.offsetWidth / canvasWrapper.value.offsetHeight
      camera.updateProjectionMatrix()
      renderer.setSize(
        canvasWrapper.value.offsetWidth,
        canvasWrapper.value.offsetHeight
      )
    }
  }

  window.addEventListener('resize', resize)
  resize()
})
</script>

<template>
  <!-- GameView component, contains all basic game UI 
    like settings button-->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <div class="middle" ref="canvasWrapper">
      <!-- Game UI just for 8 ball -->
      <canvas id="game-canvas" ref="canvas"></canvas>
      <p style="position: absolute">{{ fps }} fps</p>
    </div>
  </game-view>
</template>

<style>
.middle {
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.drag-surface {
  width: 100%;
  height: 100%;
  background: #00000033;
  position: absolute;
  display: none;
}

.canvas-overlay {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
