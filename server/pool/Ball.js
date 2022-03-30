// Ball.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import * as THREE from 'three'

function Ball(scene, x, y, z, name, color) {
  this.color = typeof color == 'undefined' ? 0xaa0000 : color
  this.scene = scene
  //this.texture = 'images/balls/' + name + '.png';

  this.mesh = this.createMesh(x, y, z)
  this.sphere = new THREE.Sphere(this.mesh.position, Ball.RADIUS) //used for guiding line intersection detecting
  scene.add(this.mesh)

  //this.rigidBody = this.createBody(x, y, z);
  //world.addBody(this.rigidBody);
  this.name = name
  this.fallen = false
}

Ball.RADIUS = 5.715 / 2 // cm
Ball.MASS = 0.17 // kg

Ball.prototype.createMesh = function (x, y, z) {
  var geometry = new THREE.SphereGeometry(Ball.RADIUS, 16, 16)
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

  sphere.position.set(x, y, z)

  sphere.castShadow = true
  sphere.receiveShadow = true

  return sphere
}

/*Ball.prototype.createBody = function (x, y, z) {
    var body = new CANNON.Body({
        mass: Ball.MASS,
        material: Ball.contactMaterial,
        shape: new CANNON.Sphere(Ball.RADIUS),
        position: new CANNON.Vec3(x, y, z)
    });

    body.linearDamping = 0.1;
    body.allowSleep = true;

    body.sleepSpeedLimit = 0.5; // sleep if speed <0.05
    body.sleepTimeLimit = 0.1; // falls asleep after 1s of sleepiness


    return body;
};*/

Ball.prototype.tick = function (dt) {
  // this.mesh.position.copy(this.body.position);
  // this.mesh.quaternion.copy(this.body.quaternion);
}

export { Ball }
