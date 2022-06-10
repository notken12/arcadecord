// utils.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

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

/** Returns true of two points collide */
export const collision = (x1, y1, x2, y2, radius, iceSize) => {
  let mult = 1 + (100 - iceSize) / 100 / 2;
  mult = 1;
  return (x2 - x1) ** 2 + (y2 - y1) ** 2 <= (radius * 2 * mult) ** 2;
};

/** Convert an absolute position relative to the canvas wrapper bbox to a relative position */
export function toRelative(lx, ly, mobile, width, height, padding, iceSize) {
  const size = ((width - padding * 2) * iceSize) / 100;
  const tlx = width / 2 - size / 2;
  const tly = width / 2 - size / 2;
  let x = ((lx - tlx) / size) * 100;
  let y = ((ly - tly) / size) * 100;
  return {
    x,
    y,
  };
}

/** Convert a relative position to an absolute position relative to the canvas wrapper bbox */
export function fromRelative(lx, ly, mobile, width, height, padding, iceSize) {
  const size = ((width - padding * 2) * iceSize) / 100;
  const tlx = width / 2 - size / 2;
  const tly = width / 2 - size / 2;
  let x = tlx + (lx / 100) * size; // move out (ice sheet width is 100)
  let y = tly + (ly / 100) * size; // move out (ice sheet width is 100)
  return {
    x,
    y,
  };
}
