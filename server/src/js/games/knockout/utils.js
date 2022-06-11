// utils.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { calculateIntersection } from '@app/js/games/8ball/utils.js';

/** Get bounce force from a collision */
export function collisionResolution(c1x, c1y, v1x, v1y, c2x, c2y, v2x, v2y) {
  const tangent = {
    x: -(c2x - c1x),
    y: c2y - c1y,
  };
  const tLength = (tangent.y ** 2 + tangent.x ** 2) ** 0.5;
  tangent.x /= tLength;
  tangent.y /= tLength;
  const relVel = {
    x: v2x - v1x,
    y: v2y - v1y,
  };
  const length = relVel.x * tangent.x + relVel.y * tangent.y;
  return {
    x: relVel.x - tangent.x * length,
    y: relVel.y - tangent.y * length,
  };
}

/** Predict locations of collision between two moving dummies **/
export function collisionLocations(
  c1x,
  c1y,
  v1x,
  v1y,
  c2x,
  c2y,
  v2x,
  v2y,
  dumRadius,
  iceSize
) {
  let mult = 1 + (100 - iceSize) / 100 / 2;
  let r = dumRadius * mult * 1.01;
  // Get the intersection of the two directions of movement
  let p1 = { x: c1x, y: c1y };
  let p2 = { x: c1x + v1x, y: c1y + v1y };

  let p3 = { x: c2x, y: c2y };
  let p4 = { x: c2x + v2x, y: c2y + v2y };
  let i = calculateIntersection(p1, p2, p3, p4);
  if (i == null) {
    return null;
  }
  // Get the tangets of both velocities
  let t1 = Math.atan2(v1y, v1x);
  let t2 = Math.atan2(v2y, v2x);
  // Get the average of the two
  let t = Math.tan((v1y + v2y) / 2, (v1x + v2x) / 2);
  t = (Math.abs((t1 - t2) / 1) % (Math.PI / 2)) / 2;
  let vx = (v1x + v2x) / 2;
  let vy = (v1y + v2y) / 2;
  let a = Math.atan2(vy, vx);
  t = Math.abs((t1 + Math.atan2(vy, vx)) / 1);
  t = Math.abs(a - t1);
  t = Math.abs(t2 - t1) / 2;
  // Get how far the collision is from the intersection along each of the two lines
  let b = r / Math.sin(t);
  // Apply the distance to each line of movement from the intersection
  let cos = Math.cos(a);
  let sin = Math.sin(a);
  let cos1 = Math.cos(t1);
  let sin1 = Math.sin(t1);
  let cos2 = Math.cos(t2);
  let sin2 = Math.sin(t2);
  return [
    {
      x: i.x - cos1 * b,
      y: i.y - sin1 * b,
    },
    {
      x: i.x - cos2 * b,
      y: i.y - sin2 * b,
    },
    {
      x: cos,
      y: sin,
    },
  ];
}

/** Returns true of two points collide */
export const collision = (x1, y1, x2, y2, radius, iceSize) => {
  let mult = 1 + (100 - iceSize) / 100 / 2;
  // mult = 1;
  return (x2 - x1) ** 2 + (y2 - y1) ** 2 <= (radius * 2 * mult) ** 2;
};
