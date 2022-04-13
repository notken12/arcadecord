<!--
  App.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

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
import GameFlow from '@app/js/GameFlow'

import { replayAction } from '@app/js/client-framework'

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

let replayRunning = ref(false)

let gameActive

const gameActiveRef = computed(() => {
  return (
    (replaying.value || GameFlow.isItMyTurn(game.value)) && replayRunning.value
  )
})

watch(
  gameActiveRef,
  (v) => {
    gameActive = v
  },
  { immediate: true }
)

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
})
world.solver.iterations = 10
world.solver.tolerance = 0 // Force solver to use all iterations
world.allowSleep = true

function setCollisionBehavior() {
  // world.defaultContactMaterial.friction = 0.1
  // world.defaultContactMaterial.restitution = 0.85

  // var ball_floor = new CANNON.ContactMaterial(
  //   Ball.CONTACT_MATERIAL,
  //   Table.FLOOR_CONTACT_MATERIAL,
  //   { friction: 0.2, restitution: 0.5 }
  // )

  // var ball_wall = new CANNON.ContactMaterial(
  //   Ball.CONTACT_MATERIAL,
  //   Table.WALL_CONTACT_MATERIAL,
  //   { friction: 0.01, restitution: 0.75 }
  // )

  // var ball_ball = new CANNON.ContactMaterial(
  //   Ball.CONTACT_MATERIAL,
  //   Ball.CONTACT_MATERIAL,
  //   { friction: 0.055, restitution: 0.93, frictionEquationRelaxation: 1 }
  // )

  // world.addContactMaterial(ball_floor)
  // world.addContactMaterial(ball_wall)
  // world.addContactMaterial(ball_ball)

  world.defaultContactMaterial.friction = 0.1
  world.defaultContactMaterial.restitution = 0.85

  var ball_floor = new CANNON.ContactMaterial(
    Ball.CONTACT_MATERIAL,
    Table.FLOOR_CONTACT_MATERIAL,
    { friction: 0.7, restitution: 0.1 }
  )

  var ball_wall = new CANNON.ContactMaterial(
    Ball.CONTACT_MATERIAL,
    Table.WALL_CONTACT_MATERIAL,
    { friction: 0.5, restitution: 0.9 }
  )

  var ball_ball = new CANNON.ContactMaterial(
    Ball.CONTACT_MATERIAL,
    Ball.CONTACT_MATERIAL,
    {
      friction: 1,
      restitution: 0.9,
      frictionEquationRelaxation: 1,
      frictionEquationStiffness: 1e15,
      contactEquationRelaxation: 1,
      //contactEquationStiffness: 1e15,
    }
  )

  world.addContactMaterial(ball_floor)
  world.addContactMaterial(ball_wall)
  world.addContactMaterial(ball_ball)
}

let actionsToReplay = []

const canvas = ref(null)
const controlsCanvas = ref(null)
const canvasWrapper = ref(null)
const spinner = ref(null)
const spinnerEnabled = ref(!replaying.value)

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

const fps = ref(0)

let shotAngle = 0.12076394834603342
let shotPowerSetter = {
  set val(v) {
    shotPower = v
    this._v = v
  },
  get val() {
    return this._v
  },
  _v: 0,
} // for gsap
let shotPower = 0
let shotSpin = { x: 0, y: 0 }

let maxShotPower = 1
let lastShotPower

const hitBall = (p, a, s) => {
  if (balls) {
    let power = p ?? shotPower
    let angle = a ?? shotAngle
    let spin = s ?? shotSpin
    console.log('Shot power: ' + power)
    console.log(`Shot angle: ${angle}`)
    if (power < 0.05) {
      return
    }
    lastShotPower = power + 0 // remember the shot power so that
    // when the simulation ends it can run the action with the correct shot power
    cueBall.hit(power * maxShotPower, angle, spin)

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

let showControls = computed(() => {
  console.log('replayrunning', replayRunning.value)
  return !simulationRunningRef.value && replayRunning.value
})

let showControlsVal = false
watch(showControls, (v) => (showControlsVal = v), { immediate: true })

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
  if (!spinner.value) return
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

let firstActionReplayed = false

const CUE_DRAWBACK_DURATION = 0.7 // seconds
const CUE_THRUST_DURATION = 0.2 // seconds

const replayNextShot = () => {
  console.log('replaying hit')
  // 1. Get the action
  let action = actionsToReplay[0]
  if (!action) return
  let { angle, force: power, spin } = action.data
  // 2. Rotate the stick to the action's angle
  shotAngle = angle
  // 3. Show the pool stick being drawn back
  console.log(`replay power: ${power}`)
  console.log(action.data)

  const tl = gsap.timeline()
  tl.fromTo(
    shotPowerSetter,
    {
      val: 0,
    },
    {
      val: power,
      duration: CUE_DRAWBACK_DURATION,
      ease: 'power2.out',
    }
  )
  tl.to(
    shotPowerSetter,
    {
      val: 0,
      duration: CUE_THRUST_DURATION,
      ease: 'power2.in',
      onComplete() {
        // 4. Apply force to ball
        hitBall(power, angle, spin)
      },
    },
    '>'
  )
}

watch(replaying, (val) => {
  // If the replay is skipped, we need to reset the simulation
  if (!val) {
    actionsToReplay = []
    endSimulation(true)
    spinnerEnabled.value = true
    return
  } else {
    spinnerEnabled.value = false
  }
})

const endSimulation = (skipReplay) => {
  updateCueBallPos()
  // Run action if not replaying
  if (!skipReplay) {
    if (!replaying.value) {
      let newBallStates = []
      for (let ball of balls) {
        let state = {
          out: ball.out,
          position: ball.body.position,
          quaternion: ball.body.quaternion,
          color: ball.color,
          name: ball.name,
        }
        newBallStates.push(state)
      }
      $runAction('shoot', {
        angle: shotAngle,
        force: lastShotPower,
        newBallStates,
      })
    }
    // Replay next action if replaying
    else {
      let action = actionsToReplay.shift()
      replayAction(game.value, action)
      if (actionsToReplay.length === 0) {
        $endReplay(0)
        firstActionReplayed = false
      } else {
        setTimeout(() => {
          replayNextShot()
        }, 0)
      }
    }
  }

  simulationRunningRef.value = false
}

let cpos

const updateCollisionPos = () => {
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
  cpos = createVector(
    collision.x,
    Ball.RADIUS,
    collision.y,
    camera,
    canvas.value.width,
    canvas.value.height
  )
  return {
    angle,
    cos,
    sin,
    vec,
    collision,
  }
}

let cueBallPos, offsetVector, ballDisplayRadius

const updateCueBallPos = () => {
  cueBallPos = createVector(
    cueBall.body.position.x,
    cueBall.body.position.y,
    cueBall.body.position.z,
    camera,
    canvas.value.width,
    canvas.value.height
  )

  offsetVector = createVector(
    cueBall.body.position.x + Ball.RADIUS,
    cueBall.body.position.y,
    cueBall.body.position.z + Ball.RADIUS,
    camera,
    canvas.value.width,
    canvas.value.height
  )
  ballDisplayRadius = Math.max(
    offsetVector.x - cueBallPos.x,
    offsetVector.y - cueBallPos.y
  )
}

const updateBalls = () => {
  for (let i = 0; i < game.value.data.balls.length; i++) {
    let ball = balls[i]
    let nball = game.value.data.balls[i]
    Object.assign(ball, {
      out: nball.out,
      position: nball.position,
      quaternion: nball.quaternion,
    })
    ball.updateBody()
  }
}

watch(() => game.value.data.balls, updateBalls, { deep: true })

watch(() => game.value.turn, updateBalls)

watch(() => replaying.value, updateBalls)

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
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
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
  pointLight.castShadow = true
  pointLight.shadow.mapSize.width = 2048 // default
  pointLight.shadow.mapSize.height = 2048 // default
  pointLight.shadow.camera.near = 0.1 // default
  pointLight.shadow.camera.far = 4 // default
  pointLight.shadow.radius = 1
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
    if (!lastCallTime) {
      // first call
      world.step(timeStep)
      lastCallTime = time
      updateCueBallPos()
    } else {
      let dt = time - lastCallTime
      if (dt >= timeStep) {
        world.step(timeStep)
        lastCallTime = time - (dt - timeStep)
      }
    }

    frames++

    if (table.surfaceBody) {
      for (let i = 0; i < balls.length; i++) {
        balls[i].tick()
      }

      if (simulationRunning) {
        let allAtRest = true

        for (let ball of balls) {
          if (ball.body.position.y < -0.3) {
            if (ball.body.type === CANNON.Body.STATIC) {
              continue
            }

            ball.body.position.set(0, -0.3, 0)
            // ball.body.position.set(0, Ball.RADIUS, 0)
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
          endSimulation()
        }
      } else {
        if (actionsToReplay.length > 0 && !firstActionReplayed) {
          // Replay action of first shot
          replayNextShot()
          firstActionReplayed = true
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

    if (gameActive) {
      let cposResult = updateCollisionPos()
      if (!cposResult) return
      let { angle, cos, sin, vec, collision } = cposResult

      // Draw guiding line if simulation isn't running
      if (!simulationRunning) {
        // Draw cue ball collision pos
        ctx.beginPath()
        ctx.arc(cpos.x, cpos.y, ballDisplayRadius, 0, 2 * Math.PI, false)
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

        // Draw line to cue ball collision pos
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
          // Draw angles of ball bounces: cue and other ball
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
  }
  requestAnimationFrame(animate)

  setInterval(() => {
    fps.value = frames
    frames = 0
  }, 1000)
}

let spinnerDraggable

watch(
  spinnerEnabled,
  (v) => {
    if (v) {
      spinnerDraggable = Draggable.create(spinner.value, {
        type: 'rotation',
        inertia: true,
        onDrag: function () {
          shotAngle = -this.rotation * (Math.PI / 180)
        },
      })[0]
    }
  },
  { flush: 'post' }
)

onMounted(async () => {
  window.shotPower = shotPower
  window.shotPowerSetter = shotPowerSetter
  window.shotAngle = shotAngle
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

  // hitBall()
  $replayTurn(() => {
    let turn = game.value.turns[game.value.turns.length - 1]
    shotAngle = turn.actions[0].data.angle
    replayRunning.value = true
    setTimeout(() => {
      actionsToReplay = turn.actions
    }, 700)
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
      <div class="controls-wrapper" :class="{ shown: showControls && !replaying }">
        <SpinControl @spinchange="changeShotSpin($event)" />
        <PowerControl @powerchange="changeShotPower($event)" @hit="hitBall()" />
      </div>
      <div class="canvas-wrapper" ref="canvasWrapper">
        <canvas id="game-canvas" ref="canvas"></canvas>
        <canvas
          id="controls-canvas"
          ref="controlsCanvas"
          :class="{ shown: showControls }"
        ></canvas>
        <p style="position: absolute; top: 16px">{{ fps }} fps</p>
        <div id="spinner" ref="spinner"></div>
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
  opacity: 0;
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

#controls-canvas,
.controls-wrapper {
  opacity: 0;
  pointer-events: none;
}

#controls-canvas.shown,
.controls-wrapper.shown {
  opacity: 1;
  pointer-events: initial;
}

#spinner {
  width: 300vw;
  height: 300vh;
  position: absolute;
  z-index: 11;
}
</style>
