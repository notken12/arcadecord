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
  var c = fromRelative(dum.x, dum.y, mobile, width, height, padding);
  ctx.moveTo(c.x, c.y);

  var mov = fromRelative(
    dum.x + dum.moveDir.x,
    dum.y + dum.moveDir.y,
    mobile,
    width,
    height,
    padding
  );

  let angle = Math.atan2(dum.moveDir.y, dum.moveDir.x);
  let cos = Math.cos(angle);
  let sin = Math.sin(angle);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(c.x + cos * dummyRadius * 0.85, c.y + sin * dummyRadius * 0.85);
  ctx.lineTo(mov.x, mov.y);
  // ctx.strokeStyle = dum.playerIndex ? 'blue' : 'white';
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = width / 128;
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}
