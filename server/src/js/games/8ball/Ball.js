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
  quaternion = { x: 0, y: 0, z: 0, w: 1 }
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
      w: 1,
    }
    this.out = out ?? false
    this.name = name ?? 'Ball'

    this.texture = texture

    this.mesh = this.createMesh()
    this.scene.add(this.mesh)

    this.sphere = new THREE.Sphere(this.mesh.position, Ball.RADIUS) //used for guiding line intersection detecting

    this.fallen = false

    this.body = this.createBody()
    this.world.addBody(this.body)

    // console.log(this.mesh.quaternion)
    this.forward = new THREE.Vector3(1, 0, 0)
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
    sphere.receiveShadow = false

    return sphere
  }

  createBody() {
    let body = new CANNON.Body({
      mass: Ball.MASS,
      material: Ball.CONTACT_MATERIAL,
      shape: new CANNON.Sphere(Ball.RADIUS),
      position: new CANNON.Vec3(
        this.position.x,
        this.position.y,
        this.position.z
      ),
      quaternion: new CANNON.Quaternion(
        this.quaternion.x,
        this.quaternion.y,
        this.quaternion.z,
        this.quaternion.w
      ),
    })

    body.linearDamping = body.angularDamping = 0.5 // Hardcode
    body.allowSleep = true

    // Sleep parameters
    body.sleepSpeedLimit = 0.5 // Body will feel sleepy if speed< 0.05 (speed == norm of velocity)
    body.sleepTimeLimit = 0.1 // Body falls asleep after 1s of sleepiness

    return body
  }

  update() {
    // if (this.body.position.y > Ball.RADIUS) {
    //   this.body.position.y = Ball.RADIUS
    // }
    // if (this.body.velocity.y > 0) {
    //   this.body.velocity.y = 0
    // }
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

  hit(strength, angle, spin /* Vector2 */) {
    let a = (angle - Math.PI / 2) % (2 * Math.PI)
    this.forward.set(Math.cos(a), 0, -Math.sin(a))
    console.log(
      `hit with power ${strength} angle ${angle} spin ${JSON.stringify(spin)}`
    )
    let s = strength * 1
    var force = new CANNON.Vec3()
    force.copy(this.forward.normalize())
    force.scale(s, force)
    var point = new CANNON.Vec3()
    // point.copy(this.body.position)
    var vec = new CANNON.Vec3()
    vec.copy(this.forward)
    vec.normalize()
    vec.scale(Ball.RADIUS, vec)
    point.vsub(vec, point)
    // point = new CANNON.Vec3(0, 0, 0)
    // point.copy(this.body.position)
    // point.set(point.x, point.y, point.z)
    this.body.applyImpulse(force, point)
    // this.body.applyForce(force, point)
    console.log(vec, force, point)

    // let a = (angle - Math.PI / 2) % (2 * Math.PI)

    // this.forward.set(Math.cos(a), 0, -Math.sin(a))
    // this.forward.normalize()
    // this.body.wakeUp()
    // var point = new CANNON.Vec3()
    // point.copy(this.body.position)
    // var vec = new CANNON.Vec3()
    // vec.copy(this.forward)
    // vec.normalize()
    // vec.scale(Ball.RADIUS, vec)
    // point.vsub(vec, point)
    // var force = new CANNON.Vec3()
    // force.copy(this.forward.normalize())
    // force.scale(strength, force)
    // this.body.applyImpulse(force, point)
    // force.scale(strength * 20, force)
    // this.body.applyForce(force, point)

    // let sphereGeometry = new THREE.SphereGeometry(Ball.RADIUS / 3, 10, 10)
    // let sphereMaterial = new THREE.MeshBasicMaterial({
    //   color: 0xffff00,
    // })
    // let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    // sphere.position.set(point.x, point.y, point.z)
    // this.scene.add(sphere)
  }
}
