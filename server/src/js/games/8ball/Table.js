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
  cushionBodies

  constructor(scene, world) {
    const { PLAY_AREA } = Table

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
        friction: 0.5,
        restitution: 0.5,
      }),
      shape: new CANNON.Box(
        new CANNON.Vec3(PLAY_AREA.LEN_X / 2 - Common.Ball.RADIUS, 0.0254, PLAY_AREA.LEN_Z / 2 - Common.Ball.RADIUS)
      ),
      type: CANNON.Body.KINEMATIC,
    })
    this.surfaceBody.position.set(0, -0.0254, 0)
    this.world.addBody(this.surfaceBody)

    let cw = 0.02 // cushion thickness (half extent)
    let ch = 0.05 // cushion height (half extent)

    let cushionOptions = {
      mass: 0,
      material: new CANNON.Material({
        friction: 0.1,
        restitution: 0.75,
      }),
      type: CANNON.Body.KINEMATIC,
    }

    const shortCushionLen = PLAY_AREA.LEN_X / 2 - 0.02 * 2 // cushion length for the short side (x axis)
    const longCushionLen = PLAY_AREA.LEN_Z / 4 - 0.02 * 4 // cushion length for the long side (z axis)

    this.cushionBodies = [
      new CANNON.Body({
        // bottom (+z)
        ...cushionOptions,
        shape: new CANNON.Box(new CANNON.Vec3(shortCushionLen, ch, cw)),
        position: new CANNON.Vec3(0, 0, PLAY_AREA.LEN_Z / 2 + cw),
      }),
      new CANNON.Body({
        // top (-z)
        ...cushionOptions,
        shape: new CANNON.Box(new CANNON.Vec3(shortCushionLen, ch, cw)),
        position: new CANNON.Vec3(0, 0, PLAY_AREA.LEN_Z / -2 - cw),
      }),
      new CANNON.Body({
        // bottom left (+x+z)
        ...cushionOptions,
        shape: new CANNON.Box(new CANNON.Vec3(cw, ch, longCushionLen)),
        position: new CANNON.Vec3(
          PLAY_AREA.LEN_X / 2 + cw,
          0,
          PLAY_AREA.LEN_Z / 4
        ),
      }),
      new CANNON.Body({
        // bottom right (-x+z)
        ...cushionOptions,
        shape: new CANNON.Box(new CANNON.Vec3(cw, ch, longCushionLen)),
        position: new CANNON.Vec3(
          PLAY_AREA.LEN_X / -2 - cw,
          0,
          PLAY_AREA.LEN_Z / 4
        ),
      }),
      new CANNON.Body({
        // top left (+x-z)
        ...cushionOptions,
        shape: new CANNON.Box(new CANNON.Vec3(cw, ch, longCushionLen)),
        position: new CANNON.Vec3(
          PLAY_AREA.LEN_X / 2 + cw,
          0,
          PLAY_AREA.LEN_Z / -4
        ),
      }),
      new CANNON.Body({
        // top right (-x-z)
        ...cushionOptions,
        shape: new CANNON.Box(new CANNON.Vec3(cw, ch, longCushionLen)),
        position: new CANNON.Vec3(
          PLAY_AREA.LEN_X / -2 - cw,
          0,
          PLAY_AREA.LEN_Z / -4
        ),
      }),
    ]

    for (let body of this.cushionBodies) {
      world.addBody(body)
    }
  }
}
