<script setup>
import { useFacade } from 'components/base-ui/facade'
import { computed, ref, onMounted } from 'vue'

import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import * as CANNON from 'cannon-es'

import { Ball } from '@app/js/games/8ball/Ball'
import { Table } from '@app/js/games/8ball/Table'

import CannonDebugger from 'cannon-es-debugger'

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
const controlsCanvas = ref(null)
const canvasWrapper = ref(null)

let orbitControlsEnabled = true
let scene,
  camera,
  orbitControls,
  renderer,
  tableSurfaceBody,
  table,
  balls,
  cueBall

const fps = ref(0)

let shotAngle = 0
let shotPower = 40

const hitBall = () => {
  console.log('test hit')
  if (balls) {
    let force = new THREE.Vector3(0, 0, shotPower)
    force.applyAxisAngle(new THREE.Vector3(0, 1, 0), shotAngle)
    force = new CANNON.Vec3(force.x, force.y, force.z)
    balls[0].body.applyForce(force, cueBall.body.position)
    simulationRunning = true
  }
}

let simulationRunning = false

let scale

const initThree = async () => {
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
  /* renderer.shadowMap.enabled = true */
  /* renderer.shadowMap.type = THREE.PCFSoftShadowMap // default THREE.PCFShadowMap */
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(
    canvasWrapper.value.offsetWidth,
    canvasWrapper.value.offsetHeight
  )

  camera.position.set(0, 2, 0)

  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
  scene.add(light)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

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
      b.out
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

  function createVector(x, y, z, camera, width, height) {
    var p = new THREE.Vector3(x, y, z)
    var vector = p.project(camera)

    vector.x = ((vector.x + 1) / 2) * width
    vector.y = (-(vector.y - 1) / 2) * height

    return vector
  }

  let time = new Date().getTime()

  let frames = 0

  let ctx = controlsCanvas.value.getContext('2d')

  let cueStickImage = new Image()
  cueStickImage.src = '/dist/assets/8ball/cuestick.svg'
  let cueStickImageLoaded = false

  cueStickImage.onload = () => {
    cueStickImageLoaded = true
  }

  function animate() {
    if (!controlsCanvas.value) return
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

    cannonDebugger.update() // Update the CannonDebugger meshes

    // Render THREE.js
    renderer.render(scene, camera)

    ctx.clearRect(0, 0, controlsCanvas.value.width, controlsCanvas.value.height)

    if (simulationRunning) return

    let cueBallPos = createVector(
      cueBall.body.position.x,
      cueBall.body.position.y,
      cueBall.body.position.z,
      camera,
      canvas.value.width,
      canvas.value.height
    )

    let ballDisplayRadius =
      createVector(
        cueBall.body.position.x + Ball.RADIUS,
        cueBall.body.position.y,
        cueBall.body.position.z,
        camera,
        canvas.value.width,
        canvas.value.height
      ).x - cueBallPos.x

    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()

    let cos = Math.cos(-shotAngle + Math.PI / 2)
    let sin = Math.sin(-shotAngle + Math.PI / 2)

    ctx.moveTo(
      cueBallPos.x + cos * ballDisplayRadius,
      cueBallPos.y + sin * ballDisplayRadius
    )
    ctx.lineTo(cueBallPos.x + cos * 1000, cueBallPos.y + sin * 1000)
    ctx.stroke()

    ctx.save()

    let oppCos = Math.cos(-shotAngle - Math.PI / 2)
    let oppSin = Math.sin(-shotAngle - Math.PI / 2)

    ctx.translate(cueBallPos.x, cueBallPos.y)
    ctx.rotate(-shotAngle - Math.PI)

    if (cueStickImageLoaded) {
      ctx.drawImage(
        cueStickImage,
        -(cueStickImage.width / 2) * scale,
        ballDisplayRadius * 2,
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

onMounted(async () => {
  scale = window.devicePixelRatio

  await initThree()

  function resize() {
    if (canvasWrapper.value) {
      scale = window.devicePixelRatio
      //   const aspect =
      //     canvasWrapper.value.offsetWidth / canvasWrapper.value.offsetHeight
      //   const frustumSize = 3.4
      //   camera.left = (frustumSize * aspect) / -2
      //   camera.right = (frustumSize * aspect) / 2
      //   camera.top = frustumSize / 2
      //   camera.bottom = frustumSize / -2
      //   camera.updateProjectionMatrix()
      //   renderer.setSize(
      //     canvasWrapper.value.offsetWidth,
      //     canvasWrapper.value.offsetHeight
      //   )

      //   controlsCanvas.value.width = canvasWrapper.value.offsetWidth
      //   controlsCanvas.value.height = canvasWrapper.value.offsetHeight

      var container = canvasWrapper.value
      const cWidth = container.offsetWidth
      const cHeight = container.offsetHeight

      var newWidth
      var newHeight

      var mode = 'portrait'

      if (cWidth > cHeight) {
        // landscape
        newHeight = cHeight
        newWidth = (cHeight * 59) / 103

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

      var frustumSize = 2.7

      if (mode == 'portrait') {
        frustumSize = 2.7
      }

      const aspect = newWidth / newHeight

      camera.left = (frustumSize * aspect) / -2
      camera.right = (frustumSize * aspect) / 2
      camera.top = frustumSize / 2
      camera.bottom = frustumSize / -2

      camera.position.set(0, 2, 0)
      camera.rotation.x = Math.PI / 2

      // let vec = new THREE.Vector3(
      //   camera.rotation.x,
      //   camera.rotation.y,
      //   camera.rotation.z
      // )

      // if (mode == 'landscape') {
      //   // object is looking down
      //   vec.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI)
      //   camera.rotation.setFromVector3(vec)
      // } else {
      //   camera.rotation.setFromVector3(vec)
      // }

      console.log(`resize: ${newWidth} x ${newHeight} ${mode} scale: ${scale}`)

      camera.updateProjectionMatrix()
    }
  }

  window.addEventListener('resize', resize)
  resize()

  window.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
      hitBall()
    }
  })

  window.addEventListener('keypress', (e) => {
    if (e.key === 'a') {
      shotAngle += 0.02
    }
    if (e.key === 'd') {
      shotAngle -= 0.02
    }
  })
})
</script>

<template>
  <!-- GameView component, contains all basic game UI 
    like settings button-->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <div class="middle">
      <!-- Game UI just for 8 ball -->
      <div></div>
      <div class="canvas-wrapper" ref="canvasWrapper">
        <canvas id="game-canvas" ref="canvas"></canvas>
        <canvas id="controls-canvas" ref="controlsCanvas"></canvas>
        <p style="position: absolute; top: 16px">{{ fps }} fps</p>
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

.drag-surface {
  width: 100%;
  height: 100%;
  background: #00000033;
  position: absolute;
  display: none;
}

#controls-canvas {
  position: absolute;
  z-index: 10;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
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
}
</style>
