// Import client-framework.js, which you need to connect to the server
import * as Client from '@app/js/client-framework.js'

// Use vue
import * as Vue from 'vue'

import { GameView, createApp } from '@app/js/ui.js'

import bus from '@app/js/vue-event-bus.js'

import 'scss/games/8ball.scss'

// import the UMD bundle enable3d.framework.min.js
// or from npm enable3d
import {
  Project,
  Scene3D,
  PhysicsLoader,
  ExtendedObject3D,
  ExtendedMesh,
} from 'enable3d'
import { Vector3, OrthographicCamera } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { Ball } from './Ball'
import { Table } from './Table'
import { CueBall } from './CueBall'

// Get game ID from URL address

var gameId = Client.utils.getGameId(window.location)

// Connect the socket to the server

Client.connect(gameId, connectionCallback)

function connectionCallback(response) {
  if (!response.game) return

  // Nice UI components for the basic UI

  const App = {
    data() {
      return {
        game: response.game,
        me: response.discordUser,
        ballCoords: null,
      }
    },
    computed: {
      hint() {
        return ''
      },
      ballCoordsStyles() {
        return {
          top: this.ballCoords.y + 'px',
          left: this.ballCoords.x + 'px',
        }
      },
    },
    components: {
      GameView,
    },
    async mounted() {
      var vm = this

      class MainScene extends Scene3D {
        // 1 UNIT = 1 centimeter
        constructor() {
          super()
        }

        stick
        cueBall
        balls
        debugCam = false

        async init() {
          this.renderer.setPixelRatio(Math.max(1, window.devicePixelRatio / 2))
          // this.camera = new OrthographicCamera();
          this.camera.position.set(0, 500, 0)

          let updateSize = () => {
            var container = vm.$refs.canvasContainer.getBoundingClientRect()
            const cWidth = container.width
            const cHeight = container.height

            var newWidth
            var newHeight

            var mode = 'portrait'

            if (cWidth > cHeight) {
              // landscape
              newWidth = cWidth
              newHeight = (cWidth * 59) / 103

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

            this.renderer.setSize(newWidth, newHeight)

            var frustumSize = 150

            if (mode == 'portrait') {
              frustumSize = 262
            }

            const aspect = newWidth / newHeight

            this.camera.left = (frustumSize * aspect) / -2
            this.camera.right = (frustumSize * aspect) / 2
            this.camera.top = frustumSize / 2
            this.camera.bottom = frustumSize / -2

            this.camera.position.set(0, 500, 0)
            this.camera.lookAt(0, 0, 0)

            if (mode == 'landscape') {
              // object is looking down
              this.camera.rotation.z = (Math.PI / 2) * 3
            } else {
              this.camera.rotation.z = Math.PI
            }

            this.camera.updateProjectionMatrix()
          }

          updateSize()

          // init third dimension with a custom camera
          // https://threejs.org/docs/#api/en/cameras/OrthographicCamera

          const resize = () => {
            updateSize()
          }

          window.onresize = resize

          bus.on('debugcam', () => {
            this.debugCam = !this.debugCam
          })
        }

        async preload() {
          // preload your assets here
          this.table = new Table(this)

          let loader = new GLTFLoader()

          loader.load('/3d_models/cue_stick.glb', (gltf) => {
            const mesh = gltf.scene.children.find((child) => {
              return child.type == 'Mesh' && child.name == 'Cue_Stick'
            })
            let stick = new ExtendedObject3D()
            stick.add(mesh)
            stick.position.setY(8)
            stick.castShadow = true
            stick.receiveShadow = false
            this.add.existing(stick)
            this.stick = stick
          })
        }

        async create() {
          // set up scene (light, ground, grid, sky, orbitControls)
          this.warpSpeed('-ground', '-sky', '-fog')

          // enable physics debug
          this.physics.debug.enable()

          var apex = Table.PLAY_AREA.LEN_Z / 4

          var xo = Ball.RADIUS * 1
          var zo = 1 * Ball.RADIUS * Math.cos(Math.PI / 6) //how far the balls are spaced apart on z axis

          var y = CueBall.DEFAULT_POSITION.y

          this.balls = [
            new CueBall(this),

            //first row
            new Ball(this, 0, y, apex, '9ball'),

            //second row
            new Ball(this, 1 * xo, y, apex + zo, '7ball'),
            new Ball(this, -1 * xo, y, apex + zo, '12ball'),

            //third row
            new Ball(this, 2 * xo, y, apex + 2 * zo, '15ball'),
            new Ball(this, 0 * xo, y, apex + 2 * zo, '8ball'),
            new Ball(this, -2 * xo, y, apex + 2 * zo, '1ball'),

            //fourth row
            new Ball(this, 3 * xo, y, apex + 3 * zo, '6ball'),
            new Ball(this, 1 * xo, y, apex + 3 * zo, '10ball'),
            new Ball(this, -1 * xo, y, apex + 3 * zo, '3ball'),
            new Ball(this, -3 * xo, y, apex + 3 * zo, '14ball'),

            //fifth row
            new Ball(this, 4 * xo, y, apex + 4 * zo, '11ball'),
            new Ball(this, 2 * xo, y, apex + 4 * zo, '2ball'),
            new Ball(this, 0 * xo, y, apex + 4 * zo, '13ball'),
            new Ball(this, -2 * xo, y, apex + 4 * zo, '4ball'),
            new Ball(this, -4 * xo, y, apex + 4 * zo, '5ball'),
          ]

          this.cueBall = this.balls[0]
          console.log(this.cueBall)
          this.cueBall.mesh.body.applyForceX(5)

          let updateBallScreenPos = () => {
            var ballScreenPos = this.getCueBallScreenPosition()
            vm.ballCoords = {
              x: ballScreenPos.x,
              y: ballScreenPos.y,
            }
          }

          this.canvas.addEventListener('pointerdown', updateBallScreenPos)

          this.canvas.addEventListener('pointermove', (e) => {
            var ballScreenPos = this.getCueBallScreenPosition()
            vm.ballCoords = {
              x: ballScreenPos.x,
              y: ballScreenPos.y,
            }
          })
        }

        update() {
          //this.box.rotation.x += 0.01
          //this.box.rotation.y += 0.01
        }

        setStickRotation(degrees) {
          this.stick.rotation.set(0, (degrees * Math.PI) / 180, 0)
        }

        createVector(x, y, z) {
          var p = new Vector3(x, y, z)
          var vector = p.project(this.camera)

          vector.x = ((vector.x + 1) / 2) * this.canvas.width
          vector.y = (-(vector.y - 1) / 2) * this.canvas.height
          vector.z = 0

          return vector
        }

        getCueBallScreenPosition() {
          var ballCoords = this.cueBall.mesh.position.clone()
          var vector = this.createVector(
            ballCoords.x,
            ballCoords.y,
            ballCoords.z
          )
          return vector
        }
      }

      // set your project configs
      const config = { scenes: [MainScene], antialias: true, alpha: true }

      let createProject = () => {
        return new Promise((resolve, reject) => {
          // load the ammo.js file from the /lib folder and start the project
          PhysicsLoader('/lib/ammo', () => {
            var project = new Project(config)
            resolve(project)
          })
        })
      }

      // Create the scene
      var project = await createProject()
      this.$refs.canvasContainer.appendChild(project.canvas)
    },
  }

  const app = createApp(App).mount('#app')
  window.app = app

  // Receive turn events whenever another player finishes their turn
  Client.socket.on('turn', (game, turn) => {
    // Update the game UI
    // Later we will replace this with a turn animation
    Client.utils.updateGame(app.game, game)

    console.log('Turn received, now the turn is ' + game.turn)
  })

  window.Client = Client
}
