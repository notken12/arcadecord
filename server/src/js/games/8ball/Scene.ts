// import the UMD bundle enable3d.framework.min.js
// or from npm enable3d
import { Project, Scene3D, PhysicsLoader, ExtendedObject3D, ExtendedMesh } from 'enable3d'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

class MainScene extends Scene3D {
  // 1 UNIT = 1 centimeter
  constructor() {
    super()
  }

  async init() {
    this.renderer.setPixelRatio(Math.max(1, window.devicePixelRatio / 2))
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
    loader.loadAsync('/dist/3d_models/table.glb').then(gltf => {
      console.log(gltf.scene.children)
      const allowedMeshes = []

      allowedMeshes.push('Black_Void')
      // allowedMeshes.push('Cushions')
      // allowedMeshes.push('Pocket_Liners')
      allowedMeshes.push('Rail')
      allowedMeshes.push('Table_Bed')


      const meshes = gltf.scene.children.filter(child => {
        return child.type == 'Mesh' /*&& allowedMeshes.includes(child.name)*/
      })
      let table = new ExtendedObject3D()
      for (let mesh of meshes) {
        this.add.existing(mesh)
        this.physics.add.existing(mesh, { shape: 'convex' })
        mesh.body.setCollisionFlags(2)

        //mesh.body.setCollisionFlags(2)
      }
      // this.add.existing(table)
      // this.physics.add.existing(table, {shape: 'convex'})
      // table.body.setCollisionFlags(2)
    })
  }

  update() {
    //this.box.rotation.x += 0.01
    //this.box.rotation.y += 0.01
  }
}

// set your project configs
const config = { scenes: [MainScene], antialias: true }

export const createProject = () => {
  return new Promise((resolve, reject) => {
    // load the ammo.js file from the /lib folder and start the project
    PhysicsLoader('/lib/ammo', () => {
      var project: Project = new Project(config);
      resolve(project)
    });
  });

}

