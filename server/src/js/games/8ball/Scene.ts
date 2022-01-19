// import the UMD bundle enable3d.framework.min.js
// or from npm enable3d
import { Project, Scene3D, PhysicsLoader, ExtendedObject3D, ExtendedMesh } from 'enable3d'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

var width = 0
var height = 0

class MainScene extends Scene3D {
  // 1 UNIT = 1 centimeter
  constructor() {
    super()
  }

  stick: ExtendedObject3D
  width: number
  height: number

  async init() {
    this.renderer.setPixelRatio(Math.max(1, window.devicePixelRatio / 2))

    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    console.log(width, height)
  }

  async preload() {
    // preload your assets here
  }

  async create() {
    // set up scene (light, ground, grid, sky, orbitControls)
    this.warpSpeed('-ground')

    // enable physics debug
    this.physics.debug.enable()

    // position camera
    this.camera.position.set(10, 10, 20)

    // blue box (without physics)
    //this.add.box({ y: 2 }, { lambert: { color: 'deepskyblue' } })

    // pink box (with physics)
    this.physics.add.box({ y: 10 }, { lambert: { color: 'hotpink' } })

    const loader = new GLTFLoader()
    loader.load('/dist/3d_models/table.glb', gltf => {
      console.log(gltf.scene.children)



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
      console.log(this.stick)
    })
  }

  setUp() {
    // set up your scene here
  }

  update() {
    //this.box.rotation.x += 0.01
    //this.box.rotation.y += 0.01
  }
}

// set your project configs
const config = { scenes: [MainScene], antialias: true }

export const createProject = (w, h) => {
  return new Promise((resolve, reject) => {
    // load the ammo.js file from the /lib folder and start the project
    width = w
    height = h
    PhysicsLoader('/lib/ammo', () => {
      var project: Project = new Project(config);
      resolve(project)
    });
  });

}

