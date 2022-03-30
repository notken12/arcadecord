// Table.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

function Part(mesh, body) {
  this.mesh = mesh
  this.body = body
}

Part.prototype.tick = function () {
  this.mesh.position.copy(this.body.position)
  this.mesh.quaternion.copy(this.body.quaternion)
}

function Table(scene) {
  var that = this

  this.scene = scene
  this.parts = []
  const loader = new GLTFLoader()

  loader.load(
    '../3d_models/table.glb',
    function (gltf) {
      var model = gltf.scene

      model.traverse((o) => {
        if (o.type == 'Mesh') {
          o.castShadow = true
          o.receiveShadow = true
        }
      })

      scene.add(model)
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    function (error) {
      console.error(error)
    }
  )
}

Table.prototype.tick = function () {
  this.parts.forEach(function (part) {
    part.tick()
  })
}

Table.LEN_Z = 254 //cm, play area
Table.LEN_X = 127 //cm, play area

export { Table }
