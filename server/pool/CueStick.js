// CueStick.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Ball } from './Ball'
import { Table } from './Table'

//import cannon

// obj - your object (THREE.Object3D or derived)
// point - the point of rotation (THREE.Vector3)
// axis - the axis of rotation (normalized THREE.Vector3)
// theta - radian value of rotation
// pointIsWorld - boolean indicating the point is in world coordinates (default = false)
function rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
  pointIsWorld = pointIsWorld === undefined ? false : pointIsWorld

  if (pointIsWorld) {
    obj.parent.localToWorld(obj.position) // compensate for world coordinate
  }

  obj.position.sub(point) // remove the offset
  obj.position.applyAxisAngle(axis, theta) // rotate the POSITION
  obj.position.add(point) // re-add the offset

  if (pointIsWorld) {
    obj.parent.worldToLocal(obj.position) // undo world coordinates compensation
  }

  obj.rotateOnAxis(axis, theta) // rotate the OBJECT
}

function CueStick(scene) {
  var that = this
  this.scene = scene
  this.rotation = 0 // radians
  const loader = new GLTFLoader()

  loader.load(
    '../3d_models/cue_stick.glb',
    function (gltf) {
      var model = gltf.scene
      that.model = model

      if ('rotation' in that) {
        that.model.rotation.y = that.rotation
      }

      model.traverse((o) => {
        if (o.type == 'Mesh') {
          o.castShadow = true
          o.receiveShadow = true

          o.position.y = Ball.RADIUS
          o.position.z =
            Table.LEN_Z / -4 + (Ball.RADIUS + CueStick.BALL_DISTANCE)

          //var shape = new CANNON.ConvexPolyhedron(geometry.vertices, geometry.faces);
          //var shape = threeToCannon(o);

          that.mesh = o
        }
      })

      scene.add(model)
    },
    undefined,
    function (error) {
      console.error(error)
    }
  )
}

CueStick.prototype.tick = function (dt) {
  /*if (this.mesh) {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }*/
}

CueStick.prototype.setRotation = function (rot) {
  // radians
  this.rotation = rot
  if (this.model) {
    this.model.rotation.y = rot
  }
}

CueStick.prototype.rotate = function (rot) {
  // radians
  this.setRotation(this.rotation + rot)
}

CueStick.BALL_DISTANCE = 3 //cm, determines how close the cue stick is held behind the ball

export { CueStick }
