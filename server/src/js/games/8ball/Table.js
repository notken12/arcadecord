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
  holeBodies

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
        new CANNON.Vec3(
          PLAY_AREA.LEN_X / 2 - Common.Ball.RADIUS,
          0.0254,
          PLAY_AREA.LEN_Z / 2 - Common.Ball.RADIUS
        )
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

    const shortCushionLen = PLAY_AREA.LEN_X / 2 - 0.04 * 2 // cushion length for the short side (x axis)
    const longCushionLen = PLAY_AREA.LEN_Z / 4 - 0.04 * 2 // cushion length for the long side (z axis)

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
        // bottom right (+x+z)
        ...cushionOptions,
        shape: new CANNON.Box(new CANNON.Vec3(cw, ch, longCushionLen)),
        position: new CANNON.Vec3(
          PLAY_AREA.LEN_X / -2 - cw,
          0,
          PLAY_AREA.LEN_Z / 4
        ),
      }),
      new CANNON.Body({
        // top left (-x-z)
        ...cushionOptions,
        shape: new CANNON.Box(new CANNON.Vec3(cw, ch, longCushionLen)),
        position: new CANNON.Vec3(
          PLAY_AREA.LEN_X / 2 + cw,
          0,
          PLAY_AREA.LEN_Z / -4
        ),
      }),
      new CANNON.Body({
        // top right (+x-z)
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

    let holeOptions = {
      mass: 0,
      material: new CANNON.Material({
        friction: 0.1,
        restitution: 0.2,
      }),
      type: CANNON.Body.KINEMATIC,
    }

    let hl = 0.08 // half length of hole edges
    let s = Math.sqrt(cw ** 2 * 2) / 2 // width of the hole edges

    function getPosition(x, z, lenX, lenZ, scalarX, scalarZ) {
      let o = hl / Math.SQRT2 // offset from reference point

      return new CANNON.Vec3(
        (scalarX ?? 1) * (x + (lenX ?? cw) - cw / 2 + o),
        0,
        (scalarZ ?? 1) * (z + (lenZ ?? cw) - cw / 2 + o)
      )
    }

    let hbl = 0.06 // hole back half extent length
    let hbo = 0.075 // hole back offset

    let hbx = PLAY_AREA.LEN_X / 2 + hbo
    let hbz = PLAY_AREA.LEN_Z / 2 + hbo

    this.holeBodies = [
      [
        // bottom right cushion (+x+z)
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, ch, s)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            cw,
            longCushionLen
          ),
          quaternion: new CANNON.Quaternion().setFromEuler(0, -Math.PI / 4, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, ch, s)),
          position: getPosition(0, PLAY_AREA.LEN_Z / 2, shortCushionLen, cw),
          quaternion: new CANNON.Quaternion().setFromEuler(0, -Math.PI / 4, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hbl, ch, s)),
          position: new CANNON.Vec3(hbx, 0, hbz),
          quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 4, 0),
        }),
      ],
      [
        // bottom left cushion (+x-z)
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, ch, s)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            cw,
            longCushionLen,
            -1
          ),
          quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 4, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, ch, s)),
          position: getPosition(
            0,
            PLAY_AREA.LEN_Z / 2,
            shortCushionLen,
            cw,
            -1
          ),
          quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 4, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hbl, ch, s)),
          position: new CANNON.Vec3(-hbx, 0, hbz),
          quaternion: new CANNON.Quaternion().setFromEuler(0, -Math.PI / 4, 0),
        }),
      ],
    ]

    for (let group of this.holeBodies) {
      for (let body of group) {
        world.addBody(body)
      }
    }
  }
}
