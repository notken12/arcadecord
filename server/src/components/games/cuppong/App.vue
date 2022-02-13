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
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'

import { threeToCannon, ShapeType } from 'three-to-cannon';

import gsap from 'gsap'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { useFacade } from 'components/base-ui/facade'

import { getCupPosition, tableLength, tableWidth } from '@app/js/games/cuppong/Cup'

const { game, me, $replayTurn, $endReplay } = useFacade()

let hint = computed(() => {
  return ''
})

const sides = computed(() => game.value.data.sides)

const mySide = computed(() => {
  let index = game.value.myIndex === -1 ? 1 : game.myIndex
  return game.value.data.sides[index]
})

const otherSide = computed(() => {
  let index = game.value.myIndex === -1 ? 0 : game.myIndex === 0 ? 1 : 0
  return game.value.data.sides[index]
})

const cameraRotation = computed(() => {
  let x = -Math.PI / 3.5
  let y = mySide.value.color === 'red' ? Math.PI / 2 : 0
  return {
    x,
    y,
    z: 0
  }
})

const cameraPosition = computed(() => {
  let x = 0
  let y = 0.9
  let z = mySide.value.color === 'red' ? -0.2 : 0.2
  return {
    x,
    y,
    z
  }
})

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
})

const canvasWrapper = ref(null)

let scene, camera, renderer, orbitControls, tableObject, tableBody, ballObject, ballBody

let orbitControlsEnabled = true

const cupObjects = []
const cupBodies = []

const canvas = ref(null)

const initThree = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  camera = new THREE.PerspectiveCamera(75, canvasWrapper.value.clientWidth / canvasWrapper.value.clientHeight, 0.1, 1000)

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(canvasWrapper.value.clientWidth, canvasWrapper.value.clientHeight)

  if (orbitControlsEnabled) {
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.25;
  }

  const cannonDebugger = new CannonDebugger(scene, world, {
    // options...
  })


  // load table model
  const loader = new GLTFLoader()
  loader.load('/assets/cuppong/table.glb', (gltf) => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.map.minFilter = THREE.LinearFilter
        scene.add(child)

        tableObject = child

        // add table body
        tableBody = new CANNON.Body({
          mass: 0,
          shape: new CANNON.Box(new CANNON.Vec3(tableWidth / 2, 0.1, tableLength / 2)),
          position: new CANNON.Vec3(0, 0, 0),
          material: new CANNON.Material({
            friction: 0.5,
            restitution: 0.2
          }),
          type: CANNON.Body.STATIC,
        })
        tableBody.position.set(0, -0.1, 0)
        world.addBody(tableBody)
      }
    })
  })

  // load cup model
  loader.load('/assets/cuppong/red_cup.glb', (gltf) => {
    let sideCups = sides.value[0].cups
    for (let cup of sideCups) {
      let cupObject = gltf.scene.clone()
      scene.add(cupObject)
      cupObjects.push(cupObject)

      let { shape, offset, quaternion } = threeToCannon(cupObject.children[1], { type: ShapeType.MESH })
      let cupPosition = getCupPosition(cup)
      let cupBody = new CANNON.Body({
        mass: 0,
        material: new CANNON.Material({
          friction: 1,
          restitution: 0.2
        }),
        type: CANNON.Body.KINEMATIC,
        shape,
        offset,
        quaternion,
        position: new CANNON.Vec3(cupPosition.x, cupPosition.y + 0.117, cupPosition.z),
      })
      world.addBody(cupBody)
      cupBodies.push(cupBody)

      watch(cup, () => {
        let position = getCupPosition(cup)
        cupObject.position.set(position.x, position.y, position.z)
      }, { immediate: true })
    }
  })

  loader.load('/assets/cuppong/blue_cup.glb', (gltf) => {
    let sideCups = sides.value[1].cups
    for (let cup of sideCups) {
      let cupObject = gltf.scene.clone()
      scene.add(cupObject)
      cupObjects.push(cupObject)

      let { shape, offset, quaternion } = threeToCannon(cupObject.children[1], { type: ShapeType.MESH })
      let cupPosition = getCupPosition(cup)
      let cupBody = new CANNON.Body({
        mass: 0,
        material: new CANNON.Material({
          friction: 1,
          restitution: 0.2
        }),
        type: CANNON.Body.KINEMATIC,
        shape,
        offset,
        quaternion,
        position: new CANNON.Vec3(cupPosition.x, cupPosition.y + 0.117, cupPosition.z),
      })
      world.addBody(cupBody)
      cupBodies.push(cupBody)

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
  const pointLight = new THREE.PointLight(0xffffff, 0.8)
  pointLight.position.set(0, 0.5, 0)
  scene.add(pointLight)

  // add ball
  ballObject = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  )
  ballObject.position.setY(0)
  scene.add(ballObject)

  ballBody = new CANNON.Body({
    mass: 0.0027, // kg
    type: CANNON.Body.DYNAMIC,
    shape: new CANNON.Sphere(0.02),
    material: new CANNON.Material({
      friction: 0.5,
      restitution: 0.9
    }),
  })

  ballBody.position.set(ballObject.position.x, ballObject.position.y, ballObject.position.z)
  ballBody.quaternion.set(ballObject.quaternion.x, ballObject.quaternion.y, ballObject.quaternion.z, ballObject.quaternion.w)
  ballBody.linearDamping = 0.4

  world.addBody(ballBody)

  function animate() {
    requestAnimationFrame(animate);

    // Step Cannon World
    if (tableBody && ballBody) {
      world.fixedStep()
      // tableObject.position.copy(tableBody.position)
      // tableObject.quaternion.copy(tableBody.quaternion)

      ballObject.position.copy(ballBody.position)
      ballObject.quaternion.copy(ballBody.quaternion)

      if (ballBody.position.y < -2) {
        ballBody.position.set(0, 0, 0)
        ballBody.velocity.set(0, 0, 0)
        ballBody.angularVelocity.set(0, 0, 0)
      }

      if (ballBody.position.y < 0.05) {
        let nearestCup = nearestCup(ballBody.position)
      }
    }

    if (orbitControls)
      orbitControls.update()

    cannonDebugger.update() // Update the CannonDebugger meshes

    // Render THREE.js
    renderer.render(scene, camera);
  }
  animate();
}

function throwBall() {
  ballBody?.applyForce(new CANNON.Vec3(0, 0.6, -0.26), ballBody.position)
}

function nearestCup(pos) {
  let minDistance = Infinity
  let nearestCup = null
  let cupPositions = otherSide.value.cups.map(cup => {
    let position = getCupPosition(cup)
    return { cup: cup, position: new CANNON.Vec3(position.x, position.y, position.z) }
  })
  for (let cup of cupPositions) {
    let distance = Math.abs(pos.distanceTo(cup))
    if (distance < minDistance) {
      minDistance = distance
      nearestCup = cup.cup
    }
  }
  return {
    cup: nearestCup,
    distance: minDistance
  }
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

    if (orbitControls)
      orbitControls.update()
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
      <canvas id="game-canvas" ref="canvas" @click="throwBall"></canvas>
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