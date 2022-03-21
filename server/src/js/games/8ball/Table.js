import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Common from '/gamecommons/8ball'

export class Table {
  static PLAY_AREA = Common.Table.PLAY_AREA
  static FLOOR_CONTACT_MATERIAL = new CANNON.Material('floorMaterial')
  static WALL_CONTACT_MATERIAL = new CANNON.Material('wallMaterial')
  static WALL_LINES = [
    [
      // top
      { x: -Table.PLAY_AREA.LEN_X / 2, y: -Table.PLAY_AREA.LEN_Z / 2 },
      { x: Table.PLAY_AREA.LEN_X / 2, y: -Table.PLAY_AREA.LEN_Z / 2 },
    ],
    [
      // bottom
      { x: -Table.PLAY_AREA.LEN_X / 2, y: Table.PLAY_AREA.LEN_Z / 2 },
      { x: Table.PLAY_AREA.LEN_X / 2, y: Table.PLAY_AREA.LEN_Z / 2 },
    ],
    [
      // left
      { x: -Table.PLAY_AREA.LEN_X / 2, y: -Table.PLAY_AREA.LEN_Z / 2 },
      { x: -Table.PLAY_AREA.LEN_X / 2, y: Table.PLAY_AREA.LEN_Z / 2 },
    ],
    [
      // right
      { x: Table.PLAY_AREA.LEN_X / 2, y: -Table.PLAY_AREA.LEN_Z / 2 },
      { x: Table.PLAY_AREA.LEN_X / 2, y: Table.PLAY_AREA.LEN_Z / 2 },
    ],
  ]

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
      material: Table.FLOOR_CONTACT_MATERIAL,
      shape: new CANNON.Box(
        new CANNON.Vec3(
          PLAY_AREA.LEN_X / 2 - Common.Ball.RADIUS,
          0.0254,
          PLAY_AREA.LEN_Z / 2 - Common.Ball.RADIUS
        )
      ),
      // type: CANNON.Body.KINEMATIC,
    })
    this.surfaceBody.position.set(0, -0.0254, 0)
    this.world.addBody(this.surfaceBody)

    let cw = 0.0454 // cushion thickness (half extent)
    let ch = 0.2 // cushion height (half extent)

    let cushionOptions = {
      mass: 0,
      material: Table.WALL_CONTACT_MATERIAL,
      type: CANNON.Body.KINEMATIC,
    }

    const shortCushionLen = PLAY_AREA.LEN_X / 2 - 0.02 * 4 // cushion length for the short side (x axis)
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
      material: Table.WALL_CONTACT_MATERIAL,
      type: CANNON.Body.KINEMATIC,
    }

    let hh = 0.5 // half hole height
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

    let mct = 0.018161 // middle hole cushion triangle part length

    let mt = Math.tan(mct / (0.0254 * 2)) // middle hole triangle tangent
    let ms = 0.0254
    let mbo = 0.145 // middle hole back offset
    let mtl = 0.0254 // middle hole triangle length

    this.holeBodies = [
      [
        // bottom right (+x+z)
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, s)),
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
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, s)),
          position: getPosition(0, PLAY_AREA.LEN_Z / 2, shortCushionLen, cw),
          quaternion: new CANNON.Quaternion().setFromEuler(0, -Math.PI / 4, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, s)),
          position: new CANNON.Vec3(hbx, 0, hbz),
          quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 4, 0),
        }),
        // extend table surface to hole
        // new CANNON.Body({
        //   ...holeOptions,
        //   shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, s)),
        //   position: new CANNON.Vec3(
        //     PLAY_AREA.LEN_X / 2 - s * 2,
        //     -hh,
        //     PLAY_AREA.LEN_Z / 2 - s * 2
        //   ),
        //   quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 4, 0),
        // }),
      ],
      [
        // bottom left (-x+z)
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, s)),
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
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, s)),
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
          shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, s)),
          position: new CANNON.Vec3(-hbx, 0, hbz),
          quaternion: new CANNON.Quaternion().setFromEuler(0, -Math.PI / 4, 0),
        }),
        // extend table surface to hole
        // new CANNON.Body({
        //   ...holeOptions,
        //   shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, s)),
        //   position: new CANNON.Vec3(
        //     -(PLAY_AREA.LEN_X / 2 - s * 2),
        //     -hh,
        //     PLAY_AREA.LEN_Z / 2 - s * 2
        //   ),
        //   quaternion: new CANNON.Quaternion().setFromEuler(0, -Math.PI / 4, 0),
        // }),
      ],
      [
        // top right (+x-z)
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, s)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            cw,
            longCushionLen,
            1,
            -1
          ),
          quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 4, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, s)),
          position: getPosition(
            0,
            PLAY_AREA.LEN_Z / 2,
            shortCushionLen,
            cw,
            1,
            -1
          ),
          quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 4, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, s)),
          position: new CANNON.Vec3(hbx, 0, -hbz),
          quaternion: new CANNON.Quaternion().setFromEuler(0, -Math.PI / 4, 0),
        }),
        // extend table surface to hole
        // new CANNON.Body({
        //   ...holeOptions,
        //   shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, s)),
        //   position: new CANNON.Vec3(
        //     PLAY_AREA.LEN_X / 2 - s * 2,
        //     -hh,
        //     -(PLAY_AREA.LEN_Z / 2 - s * 2)
        //   ),
        //   quaternion: new CANNON.Quaternion().setFromEuler(0, -Math.PI / 4, 0),
        // }),
      ],
      [
        // top left (-x-z)
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, s)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            cw,
            longCushionLen,
            -1,
            -1
          ),
          quaternion: new CANNON.Quaternion().setFromEuler(0, -Math.PI / 4, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, s)),
          position: getPosition(
            0,
            PLAY_AREA.LEN_Z / 2,
            shortCushionLen,
            cw,
            -1,
            -1
          ),
          quaternion: new CANNON.Quaternion().setFromEuler(0, -Math.PI / 4, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, s)),
          position: new CANNON.Vec3(-hbx, 0, -hbz),
          quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 4, 0),
        }),
        // extend table surface to hole
        // new CANNON.Body({
        //   ...holeOptions,
        //   shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, s)),
        //   position: new CANNON.Vec3(
        //     -(PLAY_AREA.LEN_X / 2 - s * 2),
        //     -hh,
        //     -(PLAY_AREA.LEN_Z / 2 - s * 2)
        //   ),
        //   quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 4, 0),
        // }),
      ],
      [
        // middle right (+x)
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(mtl, hh, s)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            -mtl * 0.5 + 0.015,
            -longCushionLen - 0.5 * mtl,
            1,
            1
          ),
          quaternion: new CANNON.Quaternion().setFromEuler(0, mt, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(mtl, hh, s)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            -mtl * 0.5 + 0.015,
            -longCushionLen - 0.5 * mtl,
            1,
            -1
          ),
          quaternion: new CANNON.Quaternion().setFromEuler(0, -mt, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, ms)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            hl + 0.01,
            -longCushionLen - ms * 0.9
          ),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, ms)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            hl + 0.01,
            -longCushionLen - ms * 0.9,
            1,
            -1
          ),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, ms)),
          position: new CANNON.Vec3(PLAY_AREA.LEN_X / 2 + mbo, 0, 0),
          quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 2, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, s)),
          position: new CANNON.Vec3(PLAY_AREA.LEN_X / 2 - 0.01, -hh, 0),
          quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 2, 0),
        }),
      ],
      [
        // middle left (-x)
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(mtl, hh, s)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            -mtl * 0.5 + 0.015,
            -longCushionLen - 0.5 * mtl,
            -1,
            1
          ),
          quaternion: new CANNON.Quaternion().setFromEuler(0, -mt, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(mtl, hh, s)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            -mtl * 0.5 + 0.015,
            -longCushionLen - 0.5 * mtl,
            -1,
            -1
          ),
          quaternion: new CANNON.Quaternion().setFromEuler(0, mt, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, ms)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            hl + 0.01,
            -longCushionLen - ms * 0.9,
            -1
          ),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hl, hh, ms)),
          position: getPosition(
            PLAY_AREA.LEN_X / 2,
            PLAY_AREA.LEN_Z / 4,
            hl + 0.01,
            -longCushionLen - ms * 0.9,
            -1,
            -1
          ),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, ms)),
          position: new CANNON.Vec3(-(PLAY_AREA.LEN_X / 2 + mbo), 0, 0),
          quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 2, 0),
        }),
        new CANNON.Body({
          ...holeOptions,
          shape: new CANNON.Box(new CANNON.Vec3(hbl, hh, s)),
          position: new CANNON.Vec3(-PLAY_AREA.LEN_X / 2 + 0.01, -hh, 0),
          quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI / 2, 0),
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
