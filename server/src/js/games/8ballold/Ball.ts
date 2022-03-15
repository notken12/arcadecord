import { ExtendedObject3D, Scene3D } from 'enable3d'
import * as THREE from 'three'

export class Ball {
  static RADIUS: number = 5.715 / 2 // cm
  static MASS: number = 0.17 // kg

  scene: Scene3D
  color: number
  x: number
  y: number
  z: number
  name: string
  texture: string
  fallen: boolean
  mesh: THREE.Mesh
  sphere: THREE.Sphere

  constructor(
    scene: Scene3D,
    x: number,
    y: number,
    z: number,
    name: any,
    color: number
  ) {
    this.color = color ?? 0xaa0000

    this.scene = scene
    this.x = x
    this.y = y
    this.z = z
    this.name = name ?? 'Ball'

    this.mesh = this.createMesh()
    this.scene.add.existing(this.mesh)
    this.scene.physics.add.existing(this.mesh as ExtendedObject3D, {
      shape: 'sphere',
      radius: Ball.RADIUS,
    })
    ;(this.mesh as ExtendedObject3D).body.setCollisionFlags(0)
    this.sphere = new THREE.Sphere(this.mesh.position, Ball.RADIUS) //used for guiding line intersection detecting

    this.fallen = false
  }

  createMesh(): THREE.Mesh {
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
}
