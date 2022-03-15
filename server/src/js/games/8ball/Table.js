import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Common from '/gamecommons/8ball'

export class Table {
  static PLAY_AREA = Common.Table.PLAY_AREA

  scene
  world
  object
  surfaceBody

  constructor(scene, world) {
    this.scene = scene
    this.world = world

    let tableObject

    const loader = new GLTFLoader()
    loader.load('/dist/assets/8ball/table.glb', (gltf) => {
      tableObject = new THREE.Group()
      console.log('tableObject added')

      const meshes = gltf.scene.children.filter((child) => {
        return child.type == 'Mesh'
      })
      for (let mesh of meshes) {
        // if (mesh.name != 'Table_Bed')
        // return;
        tableObject.add(mesh)
        tableObject.castShadow = false
        tableObject.receiveShadow = true
      }

      tableObject.scale.multiplyScalar(0.01)
      scene.add(tableObject)
      
      this.object = tableObject
    })

    this.surfaceBody = new CANNON.Body({
      mass: 0,
      material: new CANNON.Material({
        friction: 0.2,
        restitution: 0,
      }),
      shape: new CANNON.Box(new CANNON.Vec3(0.5588, 0.0254, 1.1176)),
      type: CANNON.Body.KINEMATIC,
    })
    this.surfaceBody.position.set(0, -0.0254, 0)
    this.world.addBody(this.surfaceBody)
  }
}
