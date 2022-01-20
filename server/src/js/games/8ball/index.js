// Import client-framework.js, which you need to connect to the server
import * as Client from '@app/js/client-framework.js';

// Use vue
import * as Vue from 'vue';

import { GameView } from '@app/js/ui.js'

import bus from '@app/js/vue-event-bus.js';

import 'scss/games/8ball.scss';

// import the UMD bundle enable3d.framework.min.js
// or from npm enable3d
import { Project, Scene3D, PhysicsLoader, ExtendedObject3D, ExtendedMesh } from 'enable3d'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { Ball } from './Ball'

// Get game ID from URL address

var gameId = Client.utils.getGameId(window.location);

// Connect the socket to the server

Client.connect(gameId, connectionCallback);

function connectionCallback(response) {
    if (!response.game) return;

    // Nice UI components for the basic UI


    const App = {
        data() {
            return {
                game: response.game,
                me: response.discordUser,
                ballCoords: null
            }
        },
        computed: {
            hint() {
                return '';
            },
            ballCoordsStyles() {
                return {
                    top: this.ballCoords.y + 'px',
                    left: this.ballCoords.x + 'px'
                }
            }
        },
        components: {
            GameView,
        },
        async mounted() {
            var vm = this;


            class MainScene extends Scene3D {
                // 1 UNIT = 1 centimeter
                constructor() {
                    super()
                }

                stick
                cueBall

                async init() {
                    var container = vm.$refs.canvasContainer.getBoundingClientRect();
                    const newWidth = container.width;
                    const newHeight = container.height;

                    this.renderer.setPixelRatio(Math.max(1, window.devicePixelRatio / 2))

                    this.renderer.setSize(newWidth, newHeight)
        
                    const frustumSize = 100
                    const aspect = newWidth / newHeight
        
                    this.camera = new THREE.OrthographicCamera(
                        (frustumSize * aspect) / -2,
                        (frustumSize * aspect) / 2,
                        frustumSize / 2,
                        frustumSize / -2
                    );

                    this.camera.position.set(0, 500, 0)
                    this.camera.lookAt(0, 0, 0)

                    this.camera.updateProjectionMatrix()

                    // init third dimension with a custom camera
                    // https://threejs.org/docs/#api/en/cameras/OrthographicCamera

                    const resize = () => {
                        var container = vm.$refs.canvasContainer.getBoundingClientRect();
                        const newWidth = container.width;
                        const newHeight = container.height;
        
                        const aspect = newWidth / newHeight
        
                        this.renderer.setSize(newWidth, newHeight)
        
                        this.camera.left = (frustumSize * aspect) / -2;
                        this.camera.right = (frustumSize * aspect) / 2;
                        this.camera.top = frustumSize / 2;
                        this.camera.bottom = frustumSize / -2;
        
                        this.camera.updateProjectionMatrix()

        
                    }
        
                    window.onresize = resize
                }

                async preload() {
                    // preload your assets here
                }

                async create() {
                    // set up scene (light, ground, grid, sky, orbitControls)
                    this.warpSpeed('-ground', '-orbitControls')

                    // enable physics debug
                    this.physics.debug.enable()

                    // position camera

                    // blue box (without physics)
                    //this.add.box({ y: 2 }, { lambert: { color: 'deepskyblue' } })

                    // pink box (with physics)
                    //this.physics.add.box({ y: 10 }, { lambert: { color: 'hotpink' } })

                    // white ball (with physics)
                    this.cueBall = this.physics.add.sphere({ y: 10, radius: Ball.RADIUS }, { lambert: { color: 'white' } })

                    const loader = new GLTFLoader()
                    loader.load('/dist/3d_models/table.glb', gltf => {



                        const meshes = gltf.scene.children.filter(child => {
                            return child.type == 'Mesh'
                        })
                        for (let mesh of meshes) {
                            let object = new ExtendedObject3D()
                            object.add(mesh)
                            object.castShadow = false
                            object.receiveShadow = true
                            this.add.existing(object)
                            this.physics.add.existing(object, { shape: 'convex' })
                            object.body.setCollisionFlags(2)
                        }
                    })

                    loader.load('/dist/3d_models/cue_stick.glb', gltf => {
                        const mesh = gltf.scene.children.find(child => {
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

                    let updateBallScreenPos = () => {
                        var ballScreenPos = this.getCueBallScreenPosition()
                        vm.ballCoords = {
                            x: ballScreenPos.x,
                            y: ballScreenPos.y
                        }
                    }

                    this.canvas.addEventListener('pointerdown', updateBallScreenPos)

                    this.canvas.addEventListener('pointermove', (e) => {
                        var ballScreenPos = this.getCueBallScreenPosition()
                        vm.ballCoords = {
                            x: ballScreenPos.x,
                            y: ballScreenPos.y
                        }
                    })
                }

                setUp() {
                    // set up your scene here
                }

                update() {
                    //this.box.rotation.x += 0.01
                    //this.box.rotation.y += 0.01
                }

                setStickRotation(degrees) {
                    this.stick.rotation.set(0, degrees * Math.PI / 180, 0)
                }

                createVector(x, y, z) {
                    var p = new THREE.Vector3(x, y, z);
                    var vector = p.project(this.camera);

                    vector.x = (vector.x + 1) / 2 * this.canvas.width;
                    vector.y = -(vector.y - 1) / 2 * this.canvas.height;
                    vector.z = 0;

                    return vector;
                }

                getCueBallScreenPosition() {
                    var ballCoords = this.cueBall.position.clone();
                    var vector = this.createVector(ballCoords.x, ballCoords.y, ballCoords.z);
                    return vector;
                }
            }

            // set your project configs
            const config = { scenes: [MainScene], antialias: true }

            let createProject = () => {
                return new Promise((resolve, reject) => {
                    // load the ammo.js file from the /lib folder and start the project
                    PhysicsLoader('/lib/ammo', () => {
                        var project = new Project(config);
                        resolve(project)
                    });
                });

            }

            // Create the scene
            var project = await createProject();
            this.$refs.canvasContainer.appendChild(project.canvas);
        }
    }

    const app = Vue.createApp(App).mount('#app');
    window.app = app;

    // Receive turn events whenever another player finishes their turn
    Client.socket.on('turn', (game, turn) => {
        // Update the game UI
        // Later we will replace this with a turn animation
        Client.utils.updateGame(app.game, game);

        console.log('Turn received, now the turn is ' + game.turn);
    });

    window.Client = Client;
}