// utils.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

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

export function toRelative(lx, ly, mobile, width, height, padding) {
  // relative to ice
  var x, y;
  if (mobile) {
    // (l - p) * 100 / d = x
    x =
      ((lx - (width / 2 - height / 4 + padding)) * 100) /
      (height / 2 - padding * 2);
    y = ((ly - (height / 4 + padding)) * 100) / (height / 2 - padding * 2);
  } else {
    x = ((lx - (width / 4 + padding)) * 100) / (width / 2 - padding * 2);
    y =
      ((ly - (height / 2 - width / 4 + padding)) * 100) /
      (width / 2 - padding * 2);
  }
  return {
    x,
    y,
  };
}

export function fromRelative(lx, ly, mobile, width, height, padding) {
  let scale = window.devicePixelRatio;
  // relative to ice
  var x, y;
  if (mobile) {
    x =
      width / 2 -
      height / 4 +
      padding +
      ((height / 2 - padding * 2) * lx) / 100;
    y = height / 4 + padding + ((height / 2 - padding * 2) * ly) / 100;
  } else {
    x = width / 4 + padding + ((width / 2 - padding * 2) * lx) / 100;
    y =
      height / 2 - width / 4 + padding + ((width / 2 - padding * 2) * ly) / 100;
  }
  return {
    x,
    y,
  };
}
