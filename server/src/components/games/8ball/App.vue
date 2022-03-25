<script setup>
import PowerControl from './PowerControl.vue'
import SpinControl from './SpinControl.vue'

import { useFacade } from 'components/base-ui/facade'
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'

import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import * as CANNON from 'cannon-es'

import { Ball } from '@app/js/games/8ball/Ball'
import { Table } from '@app/js/games/8ball/Table'

import CannonDebugger from 'cannon-es-debugger'

import gsap from 'gsap'
import { Draggable } from 'gsap/dist/Draggable'

import { getCollisionLocation } from '@app/js/games/8ball/utils'

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
world.solver.iterations = 10
world.solver.tolerance = 0 // Force solver to use all iterations
world.allowSleep = true

function setCollisionBehavior() {
  world.defaultContactMaterial.friction = 0.1
  world.defaultContactMaterial.restitution = 0.85

  var ball_floor = new CANNON.ContactMaterial(
    Ball.CONTACT_MATERIAL,
    Table.FLOOR_CONTACT_MATERIAL,
    { friction: 0.2, restitution: 0.5 }
  )

  var ball_wall = new CANNON.ContactMaterial(
    Ball.CONTACT_MATERIAL,
    Table.WALL_CONTACT_MATERIAL,
    { friction: 0.01, restitution: 0.75 }
  )

  var ball_ball = new CANNON.ContactMaterial(
    Ball.CONTACT_MATERIAL,
    Ball.CONTACT_MATERIAL,
    { friction: 0.055, restitution: 0.93, frictionEquationRelaxation: 1 }
  )

  world.addContactMaterial(ball_floor)
  world.addContactMaterial(ball_wall)
  world.addContactMaterial(ball_ball)
}

const canvas = ref(null)
const controlsCanvas = ref(null)
const canvasWrapper = ref(null)
const spinner = ref(null)
const spinnerEnabled = ref(true)

let orbitControlsEnabled = true
let cannonDebuggerEnabled = false
let scene,
  camera,
  orbitControls,
  renderer,
  tableSurfaceBody,
  table,
  balls,
  cueBall,
  mode,
  ctx

let newBallStates = []

const fps = ref(0)

let shotAngle = 0
let shotPower = 0
let shotSpin = { x: 0, y: 0 }

let maxShotPower = 1

const hitBall = () => {
  if (balls) {
    console.log('Shot power: ' + shotPower)
    if (shotPower < 0.05) {
      return
    }
    cueBall.hit(shotPower * maxShotPower, shotAngle, shotSpin)

    simulationRunningRef.value = true
    shotPower = 0
  }
}

const changeShotPower = (power) => {
  shotPower = power
}

const changeShotSpin = (spin) => {
  shotSpin = spin
}

let simulationRunningRef = ref(false)
let simulationRunning = false

watch(simulationRunningRef, (newValue) => {
  simulationRunning = newValue
  if (newValue === false) {
    setTimeout(updateSpinner, 0)
    spinnerDraggable.enable()
  } else {
    spinnerDraggable.disable()
  }
})

let scale

const updateSpinner = () => {
  let cbbox = canvas.value.getBoundingClientRect() // canvas bounding box
  let cueBallPos = createVector(
    cueBall.body.position.x,
    cueBall.body.position.y,
    cueBall.body.position.z,
    camera,
    canvas.value.width,
    canvas.value.height
  )

  gsap.to(spinner.value, {
    duration: 0,
    left:
      cueBallPos.x / scale + cbbox.left - spinner.value.offsetWidth / 2 + 'px',
    top:
      cueBallPos.y / scale + cbbox.top - spinner.value.offsetHeight / 2 + 'px',
  })
}

function createVector(x, y, z, camera, width, height) {
  var p = new THREE.Vector3(x, y, z)
  var vector = p.project(camera)

  vector.x = ((vector.x + 1) / 2) * width
  vector.y = (-(vector.y - 1) / 2) * height

  return vector
}

const initThree = async () => {
  setCollisionBehavior()

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xeeeeee)
  const aspect =
    canvasWrapper.value.offsetWidth / canvasWrapper.value.offsetHeight
  const frustumSize = 1

  const cannonDebugger = new CannonDebugger(scene, world, {
    // options...
  })

  camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    5
  )

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMapSoft = true
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(
    canvasWrapper.value.offsetWidth,
    canvasWrapper.value.offsetHeight
  )

  camera.position.set(0, 2, 0)

  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
  // scene.add(light)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 1.2)
  pointLight.position.set(0, 2, 0)
  scene.add(pointLight)

  table = new Table(scene, world)

  balls = []

  for (let b of game.value.data.balls) {
    let ball = new Ball(
      scene,
      world,
      b.position.x,
      b.position.y,
      b.position.z,
      b.name,
      b.color,
      b.quaternion,
      b.out,
      `/assets/8ball/${b.name}.jpg`
    )
    balls.push(ball)
  }

  cueBall = balls.find((b) => b.name === 'cueball')

  if (orbitControlsEnabled) {
    orbitControls = new OrbitControls(camera, renderer.domElement)
    orbitControls.enableDamping = true
    orbitControls.dampingFactor = 0.1
  }

  window.scene = scene
  window.camera = camera
  window.world = world
  window.game = game.value
  window.balls = balls

  let frames = 0

  ctx = controlsCanvas.value.getContext('2d')

  let cueStickImage = new Image()
  cueStickImage.src = '/assets/8ball/cuestick.svg'
  let cueStickImageLoaded = false

  cueStickImage.onload = () => {
    cueStickImageLoaded = true
  }

  const timeStep = 1 / 60 // seconds
  let lastCallTime

  let directionLineLength = 8

  function animate() {
    if (!controlsCanvas.value) return
    requestAnimationFrame(animate)

    const time = performance.now() / 1000 // seconds
    let dt
    if (!lastCallTime) {
      world.step(timeStep)
      lastCallTime = time
    } else {
      dt = time - lastCallTime
      if (dt >= 1000 * timeStep) {
        world.step(timeStep)
        lastCallTime = time - (1000 * timeStep - dt)
      }
    }

    frames++

    if (table.surfaceBody) {
      world.fixedStep()

      for (let i = 0; i < balls.length; i++) {
        balls[i].update()
      }

      if (simulationRunning) {
        let allAtRest = true

        for (let ball of balls) {
          if (ball.body.position.y < -0.3) {
            if (ball.body.type === CANNON.Body.STATIC) {
              continue
            }

            ball.body.position.set(0, -0.3, 0)
            ball.body.velocity.set(0, 0, 0)
            ball.body.angularVelocity.set(0, 0, 0)
            ball.body.type = CANNON.Body.STATIC
            ball.body.mass = 0
            ball.body.sleep()
          } else if (
            ball.body.sleepState !== CANNON.BODY_SLEEP_STATES.SLEEPING
          ) {
            allAtRest = false
            break
          }
        }

        if (allAtRest) {
          // RUN ACTION HERE
          simulationRunningRef.value = false
        }
      }
    }

    if (orbitControls) {
      orbitControls.update()
    }

    if (cannonDebuggerEnabled) cannonDebugger.update() // Update the CannonDebugger meshes

    // Render THREE.js
    renderer.render(scene, camera)

    ctx.clearRect(0, 0, controlsCanvas.value.width, controlsCanvas.value.height)

    // if (simulationRunning) return

    let cueBallPos = createVector(
      cueBall.body.position.x,
      cueBall.body.position.y,
      cueBall.body.position.z,
      camera,
      canvas.value.width,
      canvas.value.height
    )

    let offsetVector = createVector(
      cueBall.body.position.x + Ball.RADIUS,
      cueBall.body.position.y,
      cueBall.body.position.z + Ball.RADIUS,
      camera,
      canvas.value.width,
      canvas.value.height
    )
    let ballDisplayRadius = Math.max(
      offsetVector.x - cueBallPos.x,
      offsetVector.y - cueBallPos.y
    )

    let angle = -shotAngle + (mode == 'landscape' ? Math.PI / 2 : 0)

    let cos = Math.cos(angle + Math.PI / 2)
    let sin = Math.sin(angle + Math.PI / 2)

    let vec = { x: cos, z: sin }
    if (mode == 'landscape') {
      let tx = vec.x + 0
      let tz = vec.z + 0
      vec.x = tx * Math.cos(Math.PI / -2) - tz * Math.sin(Math.PI / -2)
      vec.z = tx * Math.sin(Math.PI / -2) + tz * Math.cos(Math.PI / -2)
    }

    let collision = getCollisionLocation(balls, cueBall, vec)
    if (!collision) return
    let cpos = createVector(
      collision.x,
      Ball.RADIUS,
      collision.y,
      camera,
      canvas.value.width,
      canvas.value.height
    )

    ctx.beginPath()
    ctx.arc(cpos.x, cpos.y, ballDisplayRadius, 0, 2 * Math.PI, false)
    // ctx.fillStyle = 'green'
    // ctx.fill()
    ctx.lineWidth = 1 * scale
    ctx.strokeStyle = '#ffffff'
    ctx.stroke()

    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1 * scale
    ctx.beginPath()

    ctx.moveTo(
      cueBallPos.x + cos * ballDisplayRadius,
      cueBallPos.y + sin * ballDisplayRadius
    )

    if (mode == 'portrait') {
      ctx.lineTo(
        cpos.x - cos * ballDisplayRadius,
        cpos.y - sin * ballDisplayRadius
      )
    } else {
      ctx.lineTo(
        cpos.x - cos * ballDisplayRadius,
        cpos.y - sin * ballDisplayRadius
      )
    }

    ctx.stroke()

    if (collision.ballBounceAngle) {
      let ballBounceAngle =
        collision.ballBounceAngle + (mode == 'landscape' ? Math.PI / 2 : 0)

      let bbcos = Math.cos(ballBounceAngle)
      let bbsin = Math.sin(ballBounceAngle)
      ctx.moveTo(
        cpos.x + bbcos * ballDisplayRadius * 2,
        cpos.y + bbsin * ballDisplayRadius * 2
      )
      ctx.lineTo(
        cpos.x +
          bbcos *
            ballDisplayRadius *
            (2 + directionLineLength * collision.hitPower),
        cpos.y +
          bbsin *
            ballDisplayRadius *
            (2 + directionLineLength * collision.hitPower)
      )

      ctx.stroke()

      let cueBounceAngle =
        collision.cueBounceAngle + (mode == 'landscape' ? Math.PI / 2 : 0)

      let cbcos = Math.cos(cueBounceAngle)
      let cbsin = Math.sin(cueBounceAngle)
      ctx.moveTo(
        cpos.x + cbcos * ballDisplayRadius,
        cpos.y + cbsin * ballDisplayRadius
      )
      ctx.lineTo(
        cpos.x +
          cbcos *
            ballDisplayRadius *
            (1 + directionLineLength * (1 - collision.hitPower)),
        cpos.y +
          cbsin *
            ballDisplayRadius *
            (1 + directionLineLength * (1 - collision.hitPower))
      )

      ctx.stroke()
    }

    ctx.save()

    ctx.translate(cueBallPos.x, cueBallPos.y)
    if (mode == 'landscape') {
      ctx.rotate(Math.PI / 2)
    }
    ctx.rotate(-shotAngle - Math.PI)

    if (cueStickImageLoaded) {
      ctx.drawImage(
        cueStickImage,
        -(cueStickImage.width / 2) * scale,
        ballDisplayRadius * 2 +
          shotPower * Math.max(canvas.value.width, canvas.value.height) * 0.2,
        scale * cueStickImage.width,
        scale * cueStickImage.height
      )
    }

    ctx.restore()
  }
  animate()

  setInterval(() => {
    fps.value = frames
    frames = 0
  }, 1000)
}

let spinnerDraggable

onMounted(async () => {
  gsap.registerPlugin(Draggable)
  scale = window.devicePixelRatio

  await initThree()

  spinnerDraggable = Draggable.create(spinner.value, {
    type: 'rotation',
    inertia: true,
    onDrag: function () {
      shotAngle = -this.rotation * (Math.PI / 180)
    },
  })[0]

  function resize() {
    if (canvasWrapper.value) {
      scale = window.devicePixelRatio

      var container = canvasWrapper.value
      const cWidth = container.offsetWidth
      const cHeight = container.offsetHeight

      var newWidth
      var newHeight

      mode = 'portrait'

      let maxWidth = 900

      if (cWidth > cHeight) {
        // landscape
        newWidth = Math.min(cWidth, maxWidth)
        newHeight = (newWidth * 59) / 103

        var correctionRatio = cHeight / newHeight
        if (correctionRatio < 1) {
          newWidth *= correctionRatio
          newHeight *= correctionRatio
        }
        mode = 'landscape'
      } else {
        // portrait
        newHeight = cHeight
        newWidth = (cHeight * 59) / 103

        var correctionRatio = cWidth / newWidth
        if (correctionRatio < 1) {
          newWidth *= correctionRatio
          newHeight *= correctionRatio
        }
      }

      renderer.setSize(newWidth, newHeight)
      renderer.setPixelRatio(scale)
      controlsCanvas.value.width = newWidth * scale
      controlsCanvas.value.height = newHeight * scale
      controlsCanvas.value.style.width = newWidth + 'px'
      controlsCanvas.value.style.height = newHeight + 'px'

      var frustumSize = 1.55

      if (mode == 'portrait') {
        frustumSize = 2.7
      }

      const aspect = newWidth / newHeight

      camera.left = (frustumSize * aspect) / -2
      camera.right = (frustumSize * aspect) / 2
      camera.top = frustumSize / 2
      camera.bottom = frustumSize / -2

      camera.position.set(0, 2, 0)
      camera.lookAt(new THREE.Vector3(0, 0, 0))

      // let vec = new THREE.Vector3(
      //   camera.rotation.x,
      //   camera.rotation.y,
      //   camera.rotation.z
      // )

      if (mode == 'landscape') {
        camera.rotation.x = -Math.PI / 2
        camera.rotation.z = Math.PI / 2
      } else {
        camera.rotation.z = 0
      }

      console.log(`resize: ${newWidth} x ${newHeight} ${mode} scale: ${scale}`)

      setTimeout(updateSpinner, 0)

      camera.updateProjectionMatrix()
    }
  }

  window.addEventListener('resize', resize)
  resize()

  window.addEventListener('keydown', (e) => {
    if (e.key === 'a') {
      spinnerEnabled.value = !spinnerEnabled.value
    }
    if (e.key === 's') {
      cannonDebuggerEnabled = !cannonDebuggerEnabled
    }
  })
})

onUnmounted(() => {
  scene = null
  renderer = null
  camera = null
})
</script>

<template>
  <!-- GameView component, contains all basic game UI
    like settings button-->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <div class="middle">
      <!-- Game UI just for 8 ball -->
      <div class="controls-wrapper" :class="{ hidden: simulationRunningRef }">
        <SpinControl @spinchange="changeShotSpin($event)" />
        <PowerControl @powerchange="changeShotPower($event)" @hit="hitBall()" />
      </div>
      <div class="canvas-wrapper" ref="canvasWrapper">
        <canvas id="game-canvas" ref="canvas"></canvas>
        <canvas
          id="controls-canvas"
          ref="controlsCanvas"
          :class="{ hidden: simulationRunningRef || !spinnerEnabled }"
        ></canvas>
        <p style="position: absolute; top: 16px">{{ fps }} fps</p>
        <div id="spinner" ref="spinner" v-if="spinnerEnabled"></div>
      </div>
    </div>
  </game-view>
</template>

<style>
.middle {
  /* position: absolute; */
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
}

#controls-canvas {
  position: absolute;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  transition: opacity 0.3s;
}

#app,
html {
  background: #eeeeee;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.controls-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  transition: opacity 0.2s;
  /* position: relative; */
  z-index: 12;
  flex-direction: column;
  gap: 32px;
}

.controls-wrapper.hidden,
#controls-canvas.hidden {
  opacity: 0;
  pointer-events: none;
}

#spinner {
  width: 300vw;
  height: 300vh;
  position: absolute;
  z-index: 11;
}
</style>
