import { fromRelative } from '@app/js/games/knockout/utils';

export function drawMoveDirection(ctx, dum, mobile, width, height, padding) {
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
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(mov.x, mov.y);
  ctx.strokeStyle = dum.playerIndex ? 'blue' : 'white';
  ctx.lineWidth = width / 128;
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}
