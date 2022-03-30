// Cup.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import * as CANNON from 'cannon-es'
import * as THREE from 'three'

const radius = 0.046 // m
const innerRadius = 0.0285 // m
const tableEndMargin = 0.035 // m
const cupMargin = 0.02 // m
const tableLength = 2 // m
const tableWidth = 0.8 // m
const rimBoxes = 6
const height = 0.119 // m

export function getCupPosition(cup) {
  // Red: +z
  // Blue: -z
  const backOfTable =
    cup.color === 'red'
      ? tableLength / 2 + -tableEndMargin - radius
      : -tableLength / 2 + tableEndMargin + radius
  const offsetZ =
    cup.color === 'red'
      ? 2 * radius * Math.cos(Math.PI / 6) * -1
      : 2 * radius * Math.cos(Math.PI / 6)
  // const offsetZ = cup.color === 'red' ? -2 * radius : 2 * radius
  const offset = cup.color === 'red' ? -radius * 2 : radius * 2
  // const offset = cup.color === 'red' ? 2 * radius / Math.sin(Math.PI / 3) : -2 * radius / Math.sin(Math.PI / 3)
  const cupMarginOffset = cup.color === 'red' ? -cupMargin : cupMargin
  const oddRow = cup.row % 2 === 1
  let x = cup.rowPos * offset
  let z = backOfTable + cup.rowNum * offsetZ
  let y = 0
  if (cup.out) {
    x += cup.color === 'red' ? -5 : 5
    y += 0.15
  }
  return { x, y, z }
}

function rotatePoint(point, angle, origin) {
  let cos = Math.cos(angle)
  let sin = Math.sin(angle)
  return {
    x: cos * point.x + sin * point.y + origin.x,
    y: cos * point.y - sin * point.x + origin.y,
  }
}

function getRimTrimesh(height, thickness, width, innerRadius, outerRadius) {
  let d = outerRadius - innerRadius
  // prettier-ignore
  let vertices = [
    // Bottom face
    -width / 2, 0, -d / 2 - thickness, // vertex 0
    width / 2, 0, -d / 2 - thickness, // vertex 1
    -width / 2, 0, -d / 2, // vertex 2
    width / 2, 0, -d / 2, // vertex 3
    // Top face
    -width / 2, height, d / 2 - thickness, // vertex 4
    width / 2, height, d / 2 - thickness, // vertex 5
    -width / 2, height, d / 2, // vertex 6
    width / 2, height, d / 2, // vertex 7
  ]
  // prettier-ignore
  let indices = [
    // Bottom face
    0, 1, 2,
    1, 3, 2,
    // Top face
    4, 5, 6,
    5, 7, 6,
    // Left face
    0, 2, 4,
    2, 6, 4,
    // Right face
    1, 3, 5,
    3, 7, 5,
    // Inner face
    0, 1, 4,
    1, 5, 4,
    // Outer face
    2, 3, 6,
    3, 7, 6,
  ]
  return new CANNON.Trimesh(vertices, indices)
}

function addRimShapes(body, count, innerRadius, radius, height, thickness) {
  let angle = Math.tan(height / (radius - innerRadius))
  var box_increment_angle = (Math.PI * 2) / count //base value for the angle of a boxes center to the center of the circle
  // Get box x-len according to radius so that there is no overlap
  var x_len = radius * Math.tan(box_increment_angle) * 0.6

  for (let i = 0; i < count; i++) {
    let shape = getRimTrimesh(height, thickness, x_len, innerRadius, radius)

    let point = { x: 0, y: (radius + innerRadius) / 2 + thickness / 2 }
    let rotatedPoint = rotatePoint(point, i * box_increment_angle, {
      x: 0,
      y: 0,
    })
    let offset = new CANNON.Vec3(rotatedPoint.x, 0, rotatedPoint.y)

    let orientation = new CANNON.Quaternion().setFromEuler(
      0,
      i * box_increment_angle,
      0
    )
    body.addShape(shape, offset, orientation)
  }
}

export function getCupBody(cup) {
  let cupPosition = getCupPosition(cup)
  let cupBody = new CANNON.Body({
    mass: 0,
    material: new CANNON.Material({
      friction: 0.5,
      restitution: 0.6,
    }),
    type: cup.out ? CANNON.Body.STATIC : CANNON.Body.KINEMATIC,
    isTrigger: cup.out,
    position: new CANNON.Vec3(cupPosition.x, cupPosition.y, cupPosition.z),
  })

  addRimShapes(cupBody, rimBoxes, innerRadius, radius, height, 0.015)

  return cupBody
}

export { tableLength, tableWidth }
