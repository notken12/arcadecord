import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Common from '/gamecommons/8ball'
import { textureLoader } from './textureLoader.js'

export class Ball {
  static RADIUS = Common.Ball.RADIUS // m
  static MASS = Common.Ball.MASS // kg
  static CONTACT_MATERIAL = new CANNON.Material('ballMaterial')

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

  constructor(scene, world, x, y, z, name, color, quaternion, out, texture) {
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

    this.texture = texture

    this.mesh = this.createMesh()
    this.scene.add(this.mesh)

    this.sphere = new THREE.Sphere(this.mesh.position, Ball.RADIUS) //used for guiding line intersection detecting

    this.fallen = false

    this.body = this.createBody()

    // console.log(this.mesh.quaternion)
  }

  createMesh() {
    var geometry = new THREE.SphereGeometry(Ball.RADIUS, 10, 10)
    var material = new THREE.MeshPhongMaterial({
      specular: 0xffffff,
      shininess: 100,
      reflectivity: 0.1,
      //envMap: Ball.envMap,
      combine: THREE.AddOperation,
      flatShading: false,
      color: new THREE.Color(this.color ?? 0xff0000),
    })

    if (typeof this.texture == 'undefined') {
      material.color = new THREE.Color(this.color ?? 0xff0000)
    } else {
      textureLoader.load(this.texture, function (tex) {
        material.map = tex
        material.needsUpdate = true
      })
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
      material: Ball.CONTACT_MATERIAL,
      shape: new CANNON.Sphere(Ball.RADIUS),
    })

    body.linearDamping = body.angularDamping = 0.5 // Hardcode
    body.allowSleep = true

    // Sleep parameters
    body.sleepSpeedLimit = 0.5 // Body will feel sleepy if speed< 0.05 (speed == norm of velocity)
    body.sleepTimeLimit = 0.1 // Body falls asleep after 1s of sleepiness

    body.position.set(this.position.x, this.position.y, this.position.z)
    body.quaternion.set(
      this.quaternion.x,
      this.quaternion.y,
      this.quaternion.z,
      this.quaternion.w
    )
    this.world.addBody(body)

    return body
  }

  update() {
    if (this.body.position.y > Ball.RADIUS) {
      this.body.position.y = Ball.RADIUS
    }
    if (this.body.velocity.y > 0) {
      this.body.velocity.y = 0
    }
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

  hit(power, angle, spin /* Vector2 */) {
    console.log(
      `hit with power ${power} angle ${angle} spin ${JSON.stringify(spin)}`
    )
    let force = new THREE.Vector3(0, 0, power)
    force.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
    force = new CANNON.Vec3(force.x, force.y, force.z)

    let point = new THREE.Vector3(spin.x * Ball.RADIUS, spin.y * Ball.RADIUS, 0)
    point.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)

    this.body.applyImpulse(force, point)
  }
}
