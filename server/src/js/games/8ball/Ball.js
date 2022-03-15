import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class Ball {
  static RADIUS = 0.05715 / 2 // m
  static MASS = 0.17 // kg

  scene
  world
  color
  x
  y
  z
  name
  texture
  fallen
  mesh
  sphere
  body

  constructor(
    scene,
    world,
    x,
    y,
    z,
    name,
    color
  ) {
    this.color = color ?? 0xaa0000

    this.scene = scene
    this.world = world
    this.x = x
    this.y = y
    this.z = z
    this.name = name ?? 'Ball'

    this.mesh = this.createMesh()
    this.scene.add(this.mesh)

    this.sphere = new THREE.Sphere(this.mesh.position, Ball.RADIUS) //used for guiding line intersection detecting

    this.fallen = false

    this.body = this.createBody()
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
      color: new THREE.Color(0xff0000),
    })

    if (typeof this.texture == 'undefined') {
      material.color = new THREE.Color(this.color)
    } else {
      /*textureLoader.load(this.texture, function (tex) {
              material.map = tex;
              material.needsUpdate = true;
            });*/
    }

    var sphere = new THREE.Mesh(geometry, material)

    sphere.position.set(this.x, this.y, this.z)

    sphere.castShadow = true
    sphere.receiveShadow = true

    return sphere
  }

  createBody() {
    let body = new CANNON.Body({
      mass: Ball.MASS,
      material: new CANNON.Material({
        friction: 0.1,
        restitution: 0.5,
      }),
      shape: new CANNON.Sphere(Ball.RADIUS),
      type: CANNON.Body.DYNAMIC,
    })
    body.position.set(this.x, this.y, this.z)
    this.world.addBody(body)

    return body
  }

  update() {
    this.mesh.position.set(this.body.position.x, this.body.position.y, this.body.position.z)
    this.mesh.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w)
  }
}