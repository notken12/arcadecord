// canvas.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

/**
 * Draw cue ball dragging controls
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} bdr - ball display radius
 * @param {Number} scale - canvas scale (device pixel ratio)
 */
const dball = 1.2; // distance from ball in radii
const lw = 0.8; // line width for arrow in radii
const arl = 1; // arrow length in radii

function drawArrow(ctx, bdr, ox, oy) {
  ctx.beginPath();
  ctx.moveTo(bdr * dball * ox, bdr * dball * oy);

  ctx.lineWidth = bdr * lw;
  ctx.strokeStyle = 'white';
  ctx.lineTo(bdr * (dball + arl) * ox, bdr * (dball + arl) * oy);
  ctx.stroke();
}

export const drawCueControls = (ctx, bdr, scale) => {
  drawArrow(ctx, bdr, 1, 1);
  drawArrow(ctx, bdr, 1, -1);
  drawArrow(ctx, bdr, -1, -1);
  drawArrow(ctx, bdr, -1, 1);
};
