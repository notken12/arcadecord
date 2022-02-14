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

const { game, me, $replayTurn, $endReplay, $runAction, $endAnimation } = useFacade()

let hint = computed(() => {
  return ''
})

const sides = computed(() => game.value.data.sides)

const mySide = computed(() => {
  let index = game.value.myIndex === -1 ? 1 : game.value.myIndex
  return game.value.data.sides[index]
})

const otherSide = computed(() => {
  let index = game.value.myIndex === -1 ? 0 : game.value.myIndex === 0 ? 1 : 0
  return game.value.data.sides[index]
})

const cameraRotation = computed(() => {
  let x = mySide.value.color === 'red' ? -Math.PI / 3.5 : Math.PI / 3.5
  let y = mySide.value.color === 'red' ? 0 : Math.PI
  return {
    x,
    y,
    z: 0
  }
})

const cameraPosition = computed(() => {
  let x = 0
  let y = 0.9
  let z = mySide.value.color === 'red' ? 0.2 : -0.2
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
const dragSurface = ref(null)

let scene, camera, renderer, orbitControls, tableObject, tableBody, ballObject, ballBody

let orbitControlsEnabled = false

const cupObjects = []
const cupBodies = []

const canvas = ref(null)

const initThree = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xaaaaaa)
  camera = new THREE.PerspectiveCamera(75, canvasWrapper.value.clientWidth / canvasWrapper.value.clientHeight, 0.1, 1000)

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(canvasWrapper.value.clientWidth, canvasWrapper.value.clientHeight)

  if (orbitControlsEnabled) {
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.25;
  }

  // const cannonDebugger = new CannonDebugger(scene, world, {
  //   // options...
  // })


  // load table model
  const loader = new GLTFLoader()
  loader.load('/dist/assets/cuppong/table.glb', (gltf) => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.map.minFilter = THREE.LinearFilter
        child.castShadow = false
        child.receiveShadow = true
        scene.add(child)

        tableObject = child

        // add table body
        tableBody = new CANNON.Body({
          mass: 0,
          shape: new CANNON.Box(new CANNON.Vec3(tableWidth / 2, 0.1, tableLength / 2)),
          position: new CANNON.Vec3(0, 0, 0),
          material: new CANNON.Material({
            friction: 0.5,
            restitution: 0.9
          }),
          type: CANNON.Body.STATIC,
        })
        tableBody.position.set(0, -0.1, 0)
        world.addBody(tableBody)
      }
    })
  })

  // load cup model
  loader.load('/dist/assets/cuppong/red_cup.glb', (gltf) => {
    let sideCups = sides.value[0].cups
    for (let cup of sideCups) {
      let cupObject = gltf.scene.clone()
      let position = getCupPosition(cup)
      cupObject.position.set(position.x, position.y, position.z)
      cupObject.castShadow = true
      cupObject.receiveShadow = true

      scene.add(cupObject)
      cupObjects.push(cupObject)

      let { shape, offset, quaternion } = threeToCannon(cupObject.children[1], { type: ShapeType.MESH })
      let cupPosition = getCupPosition(cup)
      let cupBody = new CANNON.Body({
        mass: 0,
        material: new CANNON.Material({
          friction: 1,
          restitution: 0.5
        }),
        type: cup.out ? CANNON.Body.STATIC : CANNON.Body.KINEMATIC,
        shape,
        offset,
        quaternion,
        position: new CANNON.Vec3(cupPosition.x, cupPosition.y + 0.117, cupPosition.z),
      })
      if (cup.out)
        cupBody.type = CANNON.Body.STATIC

      world.addBody(cupBody)
      cupBodies.push(cupBody)

      watchEffect(() => {
        let position = getCupPosition(cup)

        if (cup.out || cup.color === mySide.value.color) {
          cupBody.type = CANNON.Body.STATIC
          gsap.to(cupObject.position, {
            duration: 0.5,
            y: position.y,
            ease: 'power3.inOut',
            onComplete: () => {
              gsap.to(cupObject.position, {
                x: position.x,
                y: position.y,
                z: position.z,
                duration: 0.5,
                ease: 'power3.inOut',
              })
            }
          })
        } else {
          gsap.to(cupObject.position, {
            duration: 0.5,
            x: position.x,
            y: position.y,
            z: position.z,
            ease: 'power3.inOut',
          })
          cupBody.type = CANNON.Body.KINEMATIC
          cupBody.position = new CANNON.Vec3(position.x, position.y + 0.117, position.z)
        }
      })
    }
  })

  loader.load('/dist/assets/cuppong/blue_cup.glb', (gltf) => {
    let sideCups = sides.value[1].cups
    for (let cup of sideCups) {
      let cupObject = gltf.scene.clone()
      let position = getCupPosition(cup)
      cupObject.position.set(position.x, position.y, position.z)
      cupObject.castShadow = true
      cupObject.receiveShadow = true

      scene.add(cupObject)
      cupObjects.push(cupObject)

      let { shape, offset, quaternion } = threeToCannon(cupObject.children[1], { type: ShapeType.MESH })
      let cupPosition = getCupPosition(cup)
      let cupBody = new CANNON.Body({
        mass: 0,
        material: new CANNON.Material({
          friction: 1,
          restitution: 0.5
        }),
        type: cup.out ? CANNON.Body.STATIC : CANNON.Body.KINEMATIC,
        shape,
        offset,
        quaternion,
        position: new CANNON.Vec3(cupPosition.x, cupPosition.y + 0.117, cupPosition.z),
      })
      if (cup.out)
        cupBody.type = CANNON.Body.STATIC

      world.addBody(cupBody)
      cupBodies.push(cupBody)

      watchEffect(() => {
        let position = getCupPosition(cup)

        if (cup.out || cup.color === mySide.value.color) {
          cupBody.type = CANNON.Body.STATIC
          gsap.to(cupObject.position, {
            duration: 0.5,
            y: position.y,
            ease: 'power3.inOut',
            onComplete: () => {
              gsap.to(cupObject.position, {
                x: position.x,
                y: position.y,
                z: position.z,
                duration: 0.5,
                ease: 'power3.inOut',
              })
            }
          })
        } else {
          gsap.to(cupObject.position, {
            duration: 0.5,
            x: position.x,
            y: position.y,
            z: position.z,
            ease: 'power3.inOut',
          })
          cupBody.type = CANNON.Body.KINEMATIC
          cupBody.position = new CANNON.Vec3(position.x, position.y + 0.117, position.z)
        }
      })
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

  ballObject.castShadow = true
  ballObject.receiveShadow = true

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



  const simulationDuration = 3000

  let time = new Date().getTime()
  function animate() {
    requestAnimationFrame(animate);

    let deltaTime = (new Date().getTime() - time) / 1000
    time = new Date().getTime()

    // Step Cannon World
    if (tableBody && ballBody) {
      world.fixedStep()
      // tableObject.position.copy(tableBody.position)
      // tableObject.quaternion.copy(tableBody.quaternion)

      ballObject.position.copy(ballBody.position)
      ballObject.quaternion.copy(ballBody.quaternion)

      if (simulationStartTime !== null) {
        if (time - simulationStartTime > simulationDuration) {
          simulationStartTime = null
          velocity.x = 0
          velocity.y = 0
          velocity.z = 0
          ballBody.velocity.set(0, 0, 0)
          ballBody.angularVelocity.set(0, 0, 0)
        }
      }

      if (ballBody.position.y < -2 || (ballBody.velocity.clone().normalize() <= 0.05 && ballBody.position.distanceTo(new CANNON.Vec3(0, 0, 0)) > 0.03)) {
        ballBody.position.set(0, 0, 0)
        ballBody.velocity.set(0, 0, 0)
        ballBody.angularVelocity.set(0, 0, 0)
      }

      if (ballBody.position.y < 0.04 && ballBody.position.y >= 0) {
        let { cup, distance } = nearestCup(new CANNON.Vec3(ballBody.position.x, 0, ballBody.position.z))
        if (cup && distance < 0.01) {
          ballBody.position.set(0, 0, 0)
          ballBody.velocity.set(0, 0, 0)
          ballBody.angularVelocity.set(0, 0, 0)

          $runAction('throw', {
            force: {
              x: 0,
              y: 0.6,
              z: 0.26
            },
            knockedCup: cup.id
          })
          $endAnimation(1000)
        }
      }
    }

    if (orbitControls)
      orbitControls.update()

    // cannonDebugger.update() // Update the CannonDebugger meshes

    // Render THREE.js
    renderer.render(scene, camera);
  }
  animate();
}

function throwBall() {
  ballBody?.applyForce(new CANNON.Vec3(0, 0.6, mySide.value.color === 'blue' ? 0.26 : -0.26), ballBody.position)
}

function nearestCup(pos) {
  let minDistance = Infinity
  let nearestCup = null
  let cupPositions = otherSide.value.cups.map(cup => {
    let position = getCupPosition(cup)
    return { cup: cup, position: new CANNON.Vec3(position.x, position.y, position.z) }
  })
  for (let cup of cupPositions) {
    let distance = Math.abs(pos.distanceTo(cup.position))
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

let initialMousePos = { x: 0, y: 0 }
let lastMousePos = { x: 0, y: 0 }
let velocity = { x: 0, y: 0 }
let delta = { x: 0, y: 0 }
let lastTime = 0

let simulationStartTime = null

let arr_vel = []

function pointerDown(e) {
  initialMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  lastMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  lastTime = Date.now()
  velocity = { x: 0, y: 0 }
  delta = { x: 0, y: 0 }
}

function pointerMove(e) {
  let time = Date.now()
  let deltaTime = time - lastTime
  if (deltaTime === 0) {
    return
  }
  delta = {
    x: e.touches[0].clientX - lastMousePos.x,
    y: e.touches[0].clientY - lastMousePos.y
  }
  velocity = {
    x: (velocity.x + delta.x / deltaTime) / 2,
    y: (velocity.y + delta.y / deltaTime) / 2
  }
  if (velocity.y >= 0) {
    arr_vel = []
  }
  lastMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  lastTime = time
  arr_vel.unshift({ x: velocity.x, y: velocity.y })
}

function pointerUp(e) {

  // only if it isn't right click
  if (e.button === 2) return;
  let time = Date.now();
  let sidePosNeg = mySide.value.color === 'blue' ? 1 : -1;
  let cnt = 8;
  console.log(arr_vel.length);

  if (arr_vel.length < cnt) return;


  let avgvel = arr_vel.slice(0, cnt).reduce((acc, curr) => {
    return {
      x: acc.x + curr.x,
      y: acc.y + curr.y
    }
  },
    {
      x: 0,
      y: 0
    }
  )

  avgvel.x /= cnt
  avgvel.y /= cnt
  console.log(avgvel);

  arr_vel = []

  let force = new THREE.Vector3(
    0,
    window.yForce(avgvel.y),
    window.zForce(avgvel.y) * sidePosNeg
  );
  // TODO: rotateAxis
  if (force.y <= 0) {
    return;
  }
  if (ballBody?.position.distanceTo(new CANNON.Vec3(0, 0.02, 0)) <= 0.001) {
    ballBody.applyForce(new CANNON.Vec3(force.x, force.y, force.z), ballBody.position);
    simulationStartTime = Date.now();
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
  window.getBaseLog = function (x, y) {
    return Math.log(y) / Math.log(x);
  }

  window.yForce = function (x) {
    return window.getBaseLog(50, x * -0.2 + 9);
  }

  window.zForce = function (x) {
    return window.getBaseLog(50, x * -0.2 + 2);
  }

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
    if (canvasWrapper.value) {
      camera.aspect = canvasWrapper.value.offsetWidth / canvasWrapper.value.offsetHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvasWrapper.value.offsetWidth, canvasWrapper.value.offsetHeight)
    }
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
      <canvas
        id="game-canvas"
        ref="canvas"
        @touchstart="pointerDown($event)"
        @touchmove="pointerMove($event)"
        @touchend="pointerUp($event)"
      ></canvas>
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

.drag-surface {
  width: 100%;
  height: 100%;
  background: #00000033;
  position: absolute;
  display: none;
}
</style>