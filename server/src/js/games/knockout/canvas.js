// canvas.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { fromRelative, toRelative } from '/gamecommons/knockout';

export function getHeadLen(dummyRadius) {
  return 0.7 * dummyRadius; // length of arrow head in pixels
}

/**
 * Draw the move direction of a dummy onto a canvas.
 * @returns {x: number, y: number} relative position of arrow tip
 */
export function drawMoveDirection(
  ctx,
  dum,
  mobile,
  width,
  height,
  padding,
  dummyRadius,
  opacity,
  iceSize
) {
  let scale = window.devicePixelRatio;
  const arrowColor = dum.playerIndex === 0 ? '#222222' : '#3c5a80';
  const arrowWidth = 0.3 * dummyRadius;
  const headlen = getHeadLen(dummyRadius);
  // const arrowWidth = 10;
  // Dummy location on canvas
  var c = fromRelative(dum.x, dum.y, mobile, width, height, padding, iceSize);
  ctx.moveTo(c.x, c.y);

  // Arrow head location on canvas
  var mov = fromRelative(
    dum.x + dum.moveDir.x,
    dum.y + dum.moveDir.y,
    mobile,
    width,
    height,
    padding,
    iceSize
  );

  var dx = dum.x - dum.moveDir.x;
  var dy = dum.y - dum.moveDir.y;

  let angle = Math.atan2(dum.moveDir.y, dum.moveDir.x);
  let cos = Math.cos(angle);
  let sin = Math.sin(angle);

  let arrowAngle = Math.atan2(dy, dx);

  ctx.save();
  ctx.strokeStyle = arrowColor;
  ctx.fillStyle = arrowColor;
  ctx.lineWidth = arrowWidth;
  ctx.globalAlpha = opacity;

  // Draw line
  ctx.beginPath();

  ctx.moveTo(c.x + cos * dummyRadius * 0.85, c.y + sin * dummyRadius * 0.85);
  ctx.lineTo(mov.x + cos * arrowWidth * 1, mov.y + sin * arrowWidth * 1);
  ctx.stroke();

  ctx.closePath();

  // Draw arrowhead
  ctx.beginPath();

  // Arrow tip
  let tipx = mov.x + cos * headlen * 1;
  let tipy = mov.y + sin * headlen * 1;

  ctx.moveTo(tipx, tipy);

  // Arrow left side
  ctx.lineTo(
    tipx - headlen * Math.cos(angle - Math.PI / 6),
    tipy - headlen * Math.sin(angle - Math.PI / 6)
  );

  // Arrow right side
  ctx.lineTo(
    tipx - headlen * Math.cos(angle + Math.PI / 6),
    tipy - headlen * Math.sin(angle + Math.PI / 6)
  );

  ctx.fill();

  // Draw arrowhead
  // ctx.lineTo(
  //   mov.x - headlen * Math.cos(angle - Math.PI / 6),
  //   mov.y - headlen * Math.sin(angle - Math.PI / 6)
  // );
  // ctx.moveTo(mov.x, mov.y);
  // ctx.lineTo(
  //   mov.x - headlen * Math.cos(angle + Math.PI / 6),
  //   mov.y - headlen * Math.sin(angle + Math.PI / 6)
  // );
  // ctx.stroke();

  ctx.restore();

  let relativeTip = toRelative(
    tipx,
    tipy,
    mobile,
    width,
    height,
    padding,
    iceSize
  );

  return { x: relativeTip.x, y: relativeTip.y };
}
