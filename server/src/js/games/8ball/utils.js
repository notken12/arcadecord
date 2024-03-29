// utils.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { CueBall } from './CueBall';
import { Ball } from './Ball';
import { Table, WALL_LINES } from './Table';
import * as THREE from 'three';
import Common from '/gamecommons/8ball';

export function getBalls(scene, world) {
  var apex = Table.PLAY_AREA.LEN_Z / 4;

  var xo = Ball.RADIUS * 1;
  var zo = 2 * Ball.RADIUS * Math.cos(Math.PI / 6); //how far the balls are spaced apart on z axis

  var y = CueBall.DEFAULT_POSITION.y;

  return [
    new CueBall(scene, world),

    //first row
    new Ball(scene, world, 0, y, apex, '9ball'),

    //second row
    new Ball(scene, world, 1 * xo, y, apex + zo, '7ball'),
    new Ball(scene, world, -1 * xo, y, apex + zo, '12ball'),

    //third row
    new Ball(scene, world, 2 * xo, y, apex + 2 * zo, '15ball'),
    new Ball(scene, world, 0 * xo, y, apex + 2 * zo, '8ball'),
    new Ball(scene, world, -2 * xo, y, apex + 2 * zo, '1ball'),

    //fourth row
    new Ball(scene, world, 3 * xo, y, apex + 3 * zo, '6ball'),
    new Ball(scene, world, 1 * xo, y, apex + 3 * zo, '10ball'),
    new Ball(scene, world, -1 * xo, y, apex + 3 * zo, '3ball'),
    new Ball(scene, world, -3 * xo, y, apex + 3 * zo, '14ball'),

    //fifth row
    new Ball(scene, world, 4 * xo, y, apex + 4 * zo, '11ball'),
    new Ball(scene, world, 2 * xo, y, apex + 4 * zo, '2ball'),
    new Ball(scene, world, 0 * xo, y, apex + 4 * zo, '13ball'),
    new Ball(scene, world, -2 * xo, y, apex + 4 * zo, '4ball'),
    new Ball(scene, world, -4 * xo, y, apex + 4 * zo, '5ball'),
  ];
}

export function calculateIntersection(p1, p2, p3, p4) {
  var c2x = p3.x - p4.x; // (x3 - x4)
  var c3x = p1.x - p2.x; // (x1 - x2)
  var c2y = p3.y - p4.y; // (y3 - y4)
  var c3y = p1.y - p2.y; // (y1 - y2)

  // down part of intersection point formula
  var d = c3x * c2y - c3y * c2x;

  if (d == 0) {
    return null;
  }

  // upper part of intersection point formula
  var u1 = p1.x * p2.y - p1.y * p2.x; // (x1 * y2 - y1 * x2)
  var u4 = p3.x * p4.y - p3.y * p4.x; // (x3 * y4 - y3 * x4)

  // intersection point formula

  var px = (u1 * c2x - c3x * u4) / d;
  var py = (u1 * c2y - c3y * u4) / d;

  var p = { x: px, y: py };

  return p;
}

function wrongDirection(vec, dir) {
  return !sameSign(vec.x, dir.x) && !sameSign(vec.z, dir.y);

  /*
  
    !sameSign(bx - cx, vec.x) &&
    bx - cx !== 0 &&
    !sameSign(by - cy, vec.z) &&
    by - cy !== 0
  */
}

export function getCollisionLocation2Balls(ball1, ball2, vec) {
  // ball1 is being hit, ball2 is cue ball
  let p1 = ball1.body.position;
  let p2 = ball2.body.position;

  let bx = p1.x;
  let by = p1.z;

  let cx = p2.x;
  let cy = p2.z;

  let vx = vec.x;
  let vy = vec.z;
  let vtheta = Math.atan2(vy, vx);

  let dx = cx - bx;
  let dy = cy - by;

  let d = Math.sqrt(dx * dx + dy * dy);

  let dtheta = Math.atan2(dy, dx);

  let theta = Math.abs(vtheta - dtheta);

  let side = Math.sign(d * Math.sin(theta)) * Math.sign(vtheta - dtheta);
  let a = Math.abs(d * Math.sin(theta));
  if (a > Ball.RADIUS * 2) {
    return null;
  }

  let b = Math.sqrt((2 * Ball.RADIUS) ** 2 - a ** 2);

  let i1 = { x: bx - vy * 100, y: by + vx * 100 };
  let i2 = { x: bx + vy * 100, y: by - vx * 100 };
  let i3 = { x: cx - vx * 100, y: cy - vy * 100 };
  let i4 = { x: cx + vx * 100, y: cy + vy * 100 };
  let i = calculateIntersection(i1, i2, i3, i4);

  let ox = -b * Math.cos(vtheta);
  let oy = -b * Math.sin(vtheta);

  let p = {
    x: i.x + ox,
    y: i.y + oy,
  };

  let dir = {
    x: p.x - cx,
    y: p.y - cy,
  };

  if (wrongDirection(vec, dir)) {
    return null;
  }

  return {
    x: p.x,
    y: p.y,
    // d: Math.sqrt((cx - (i.x + ox)) ** 2 + (cy - (i.y + oy)) ** 2),
    d: Math.sqrt((cx - bx) ** 2 + (cy - by) ** 2),
    ball: ball1,
    side,
    a,
  };
}

let sameSign = (n1, n2) => n1 * n2 > 0 || (n1 === 0 && n2 === 0);

export function getCollisionLocationBallLine(line, ball, vec) {
  let p1 = line[0];
  let p2 = line[1];
  let p3 = {
    x: ball.body.position.x,
    y: ball.body.position.z,
  };
  let p4 = {
    x: ball.body.position.x + vec.x,
    y: ball.body.position.z + vec.z,
  };

  // return null if the vector is not pointing towards the line
  if (
    (!sameSign(p1.x - p3.x, vec.x) || !sameSign(p1.y - p3.y, vec.z)) &&
    (!sameSign(p2.x - p3.x, vec.x) || !sameSign(p2.y - p3.y, vec.z))
  ) {
    return null;
  }

  let i = calculateIntersection(p1, p2, p3, p4);
  if (i == null) {
    return null;
  }

  let vtheta = Math.atan2(vec.z, vec.x);
  let otheta = Math.abs(Math.atan(vec.z / vec.x));

  // incorrect
  let b = (2 * Ball.RADIUS) / Math.sin(otheta);
  let ox = -b * Math.cos(vtheta);
  let oy = -b * Math.sin(vtheta);

  let p = {
    x: i.x,
    y: i.y,
    d: Math.sqrt((p3.x - i.x) ** 2 + (p3.y - i.y) ** 2),
  };

  return p;
}

/** Get collision location of ball aimed at direction vec against other balls and walls. **/
export function getCollisionLocation(balls, ball, vec) {
  let locations = [];

  for (let b of balls) {
    if (b.name === ball.name || b.out) {
      continue;
    }

    let p = getCollisionLocation2Balls(b, ball, vec);
    if (p != null) {
      locations.push(p);
    }
  }

  if (locations.length == 0) {
    let walls = WALL_LINES;
    let locations = [];
    for (let w of walls) {
      let p = getCollisionLocationBallLine(w, ball, vec);
      if (p != null) {
        locations.push(p);
      }
    }

    if (locations.length == 0) {
      return;
    }

    let min = locations[0];
    for (let l of locations) {
      if (l.d < min.d) {
        min = l;
      }
    }

    return min;
  } else {
    let min = locations[0];
    for (let l of locations) {
      if (l.d < min.d) {
        min = l;
      }
    }
    let ballBounceAngle = Math.atan2(
      min.ball.body.position.z - min.y,
      min.ball.body.position.x - min.x
    );

    let cueBounceAngle = ballBounceAngle + (Math.PI / 2) * -min.side;

    let hitPower =
      min.a === Ball.RADIUS * 2 ? 0 : 1 - min.a / (Ball.RADIUS * 2);

    return {
      x: min.x,
      y: min.y,
      d: min.d,
      a: min.a,
      side: min.side,
      ball: min.ball,
      ballBounceAngle,
      cueBounceAngle,
      hitPower,
    };
  }
}

export function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export const mousePos = (e) => {
  const { clientX: x, clientY: y } = e.touches?.[0] || e;
  return { x, y };
};

/** Mouse pos relative to a canvas **/
export const mousePosOnCanvas = (e, canvas, centered, scale) => {
  const { x, y } = mousePos(e);
  const cbbox = canvas.getBoundingClientRect();
  const cx = cbbox.x;
  const cy = cbbox.y;
  const cw = cbbox.width;
  const ch = cbbox.height;
  let mx = (x - cx) * scale;
  let my = (y - cy) * scale;
  if (centered) {
    mx = (mx / cw / scale) * 2 - 1;
    my = (my / ch / scale) * -2 + 1;
  }
  return { x: mx, y: my };
};

/**Get where a THREE.js coordinate would be drawn on screen**/
export function createVector(x, y, z, camera, width, height) {
  var p = new THREE.Vector3(x, y, z);
  var vector = p.project(camera);

  vector.x = ((vector.x + 1) / 2) * width;
  vector.y = (-(vector.y - 1) / 2) * height;

  return vector;
}

/** Get the index of the closest pocket in Common.POCKETS to a Vec3 position **/
export function getClosestPocket(pos) {
  let minD = Infinity;
  let closest;
  for (let i = 0; i < Common.POCKETS.length; i++) {
    const pocket = Common.POCKETS[i];
    const d = getDistance(pos.x, pos.z, pocket.x, pocket.z);

    if (d < minD) {
      minD = d;
      closest = i;
    }
  }
  return closest;
}
