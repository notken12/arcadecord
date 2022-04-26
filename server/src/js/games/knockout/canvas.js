import { fromRelative } from '@app/js/games/knockout/utils';

export function drawMoveDirection(
  ctx,
  dum,
  mobile,
  width,
  height,
  padding,
  dummyRadius
) {
  let scale = window.devicePixelRatio;
  const arrowColor = dum.playerIndex === 0 ? '#222222' : '#3c5a80';
  const arrowWidth = 0.3 * dummyRadius;
  const headlen = 0.7 * dummyRadius; // length of arrow head in pixels
  // const arrowWidth = 10;
  // Dummy location on canvas
  var c = fromRelative(dum.x, dum.y, mobile, width, height, padding);
  ctx.moveTo(c.x, c.y);

  // Arrow head location on canvas
  var mov = fromRelative(
    dum.x + dum.moveDir.x,
    dum.y + dum.moveDir.y,
    mobile,
    width,
    height,
    padding
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

  // Draw line
  ctx.beginPath();

  ctx.moveTo(c.x + cos * dummyRadius * 0.85, c.y + sin * dummyRadius * 0.85);
  ctx.lineTo(mov.x, mov.y);
  ctx.stroke();

  ctx.closePath();

  // Draw arrowhead
  ctx.beginPath();

  // Arrow tip
  let tipx = mov.x + cos * headlen * 0.8;
  let tipy = mov.y + sin * headlen * 0.8;

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
}
