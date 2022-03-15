import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Common from '/gamecommons/8ball'

export class Ball {
  static RADIUS = Common.Ball.RADIUS // m
  static MASS = Common.Ball.MASS // kg

  scene
  world
  color
  position = { x: 0, y: 0, z: 0 }
  quaternion = { x: 0, y: 0, z: 0, w: 0 }
  out = false
  name
  texture
  fallen
  mesh
  sphere
  body

  constructor(scene, world, x, y, z, name, color, quaternion, out) {
    this.color = color ?? 0xaa0000

    this.scene = scene
    this.world = world
    this.position.x = x
    this.position.y = y
    this.position.z = z
    this.quaternion = quaternion ?? {
      x: 0,
      y: 0,
      z: 0,
      w: 0,
    }
    this.out = out ?? false
    this.name = name ?? 'Ball'

    this.mesh = this.createMesh()
    this.scene.add(this.mesh)

    this.sphere = new THREE.Sphere(this.mesh.position, Ball.RADIUS) //used for guiding line intersection detecting

    this.fallen = false

    this.body = this.createBody()

    // console.log(this.mesh.quaternion)
  }

  createMesh() {
    var geometry = new THREE.SphereGeometry(Ball.RADIUS, 8, 8)
    var material = new THREE.MeshPhongMaterial({
      specular: 0xffffff,
      shininess: 140,
      reflectivity: 0.1,
      //envMap: Ball.envMap,
      combine: THREE.AddOperation,
      flatShading: false,
      color: new THREE.Color(this.color ?? 0xffffff),
    })

    if (typeof this.texture == 'undefined') {
      material.color = new THREE.Color(this.color ?? 0xffffff)
    } else {
      /*textureLoader.load(this.texture, function (tex) {
              material.map = tex;
              material.needsUpdate = true;
            });*/
    }

    var sphere = new THREE.Mesh(geometry, material)

    sphere.position.set(this.position.x, this.position.y, this.position.z)
    sphere.quaternion.set(
      this.quaternion.x,
      this.quaternion.y,
      this.quaternion.z,
      this.quaternion.w
    )

    sphere.castShadow = true
    sphere.receiveShadow = true

    return sphere
  }

  createBody() {
    let body = new CANNON.Body({
      mass: Ball.MASS,
      material: new CANNON.Material({
        friction: 0.06,
        restitution: 0.93,
      }),
      shape: new CANNON.Sphere(Ball.RADIUS),
      type: CANNON.Body.DYNAMIC,
    })
    body.position.set(this.position.x, this.position.y, this.position.z)
    body.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w)
    this.world.addBody(body)

    return body
  }

  update() {
    this.mesh.position.set(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    )
    this.mesh.quaternion.set(
      this.body.quaternion.x,
      this.body.quaternion.y,
      this.body.quaternion.z,
      this.body.quaternion.w
    )
  }
}
