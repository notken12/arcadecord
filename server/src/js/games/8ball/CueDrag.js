// CueDrag.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { mousePosOnCanvas } from './utils';
import { Ball } from './Ball.js';
import { Table } from './Table.js';
import { ballsOverlap } from '/gamecommons/8ball';
import * as THREE from 'three';

/** Get mouse's world position on a THREE.js plane**/
export function getMouseWorldPos(
  mx,
  my,
  plane,
  camera,
  renderer,
  raycaster,
  scale
) {
  const { x, y } = mousePosOnCanvas(
    { clientX: mx, clientY: my },
    renderer.domElement,
    true,
    scale
  );
  const mouse = new THREE.Vector2(x, y);
  raycaster.setFromCamera(mouse, camera);
  const objects = raycaster.intersectObject(plane, false); // (object, recursive)
  return objects[0]?.point; // point of intersection with plane
}

export function transformToValidPosition(x, z, balls) {
  let result = {};
  result = outOfBounds(x, z);
  result = overlaps(result.x, result.z, balls);
  // Check if the new position is valid
  let result2 = {};
  result2 = outOfBounds(result.x, result.z);
  // Return false if the corrected position is still not valid
  if (!(result.x === result2.x && result.z === result2.z)) return false;
  let result3 = {};
  result3 = overlaps(result2.x, result2.z, balls);
  if (!(result2.x === result3.x && result2.z === result3.z)) return false;
  return result;
}

function outOfBounds(x, z) {
  let result = { x, z };
  if (Math.abs(x) >= Table.PLAY_AREA.LEN_X / 2 - Ball.RADIUS) {
    result.x = Math.sign(x) * (Table.PLAY_AREA.LEN_X / 2 - Ball.RADIUS);
  }
  if (Math.abs(z) >= Table.PLAY_AREA.LEN_Z / 2 - Ball.RADIUS) {
    result.z = Math.sign(z) * (Table.PLAY_AREA.LEN_Z / 2 - Ball.RADIUS);
  }
  return result;
}

function overlaps(x, z, balls) {
  for (let ball of balls) {
    if (ballsOverlap(ball, { position: { x, z }, name: 'cueball' })) {
      // Get angle of the position relative to the other ball
      let angle = Math.atan2(z - ball.position.z, x - ball.position.x);
      let cos = Math.cos(angle + Math.PI / 2);
      let sin = Math.sin(angle + Math.PI / 2);
      return {
        x: ball.position.x + cos * Ball.RADIUS * 2,
        z: ball.position.z + sin * Ball.RADIUS * 2,
      };
    }
  }
  return { x, z };
}
