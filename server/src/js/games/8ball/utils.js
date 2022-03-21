import { CueBall } from './CueBall'
import { Ball } from './Ball'
import { Table } from './Table'

export function getBalls(scene, world) {
  var apex = Table.PLAY_AREA.LEN_Z / 4

  var xo = Ball.RADIUS * 1
  var zo = 2 * Ball.RADIUS * Math.cos(Math.PI / 6) //how far the balls are spaced apart on z axis

  var y = CueBall.DEFAULT_POSITION.y

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
  ]
}

export function calculateIntersection(p1, p2, p3, p4) {
  var c2x = p3.x - p4.x // (x3 - x4)
  var c3x = p1.x - p2.x // (x1 - x2)
  var c2y = p3.y - p4.y // (y3 - y4)
  var c3y = p1.y - p2.y // (y1 - y2)

  // down part of intersection point formula
  var d = c3x * c2y - c3y * c2x

  if (d == 0) {
    return null
  }

  // upper part of intersection point formula
  var u1 = p1.x * p2.y - p1.y * p2.x // (x1 * y2 - y1 * x2)
  var u4 = p3.x * p4.y - p3.y * p4.x // (x3 * y4 - y3 * x4)

  // intersection point formula

  var px = (u1 * c2x - c3x * u4) / d
  var py = (u1 * c2y - c3y * u4) / d

  var p = { x: px, y: py }

  return p
}

export function getCollisionLocation2Balls(ball1, ball2, vec) {
  // ball1 is being hit, ball2 is cue ball
  let p1 = ball1.body.position
  let p2 = ball2.body.position

  let bx = p1.x
  let by = p1.z

  let cx = p2.x
  let cy = p2.z

  let vx = vec.x
  let vy = vec.z
  let vtheta = Math.atan2(vy, vx)

  let dx = cx - bx
  let dy = cy - by

  let d = Math.sqrt(dx * dx + dy * dy)

  let dtheta = Math.atan2(dy, dx)

  let theta = vtheta - dtheta

  let a = d * Math.sin(theta)
  if (a > Ball.RADIUS) {
    return null
  }

  let b = Math.sqrt((2 * Ball.RADIUS) ** 2 - a ** 2)

  let ivec = {
    x: vx * -1,
    y: vy * -1,
  }
  let ivectheta = Math.atan2(ivec.y, ivec.x)

  let ix = b * Math.cos(ivectheta)
  let iy = b * Math.sin(ivectheta)

  return {
    x: bx + ix,
    y: by + iy,
    d: d,
  }
}

export function getCollisionLocationBallLine(line, ball, vec) {
  let i = calculateIntersection(
    line[0],
    line[1],
    {
      x: ball.body.position.x,
      y: ball.body.position.z,
    },
    {
      x: ball.body.position.x + vec.x * 100,
      y: ball.body.position.z + vec.y * 100,
    }
  )

  let vec1 = {
    x: vec.x * -1,
    y: vec.y * -1,
  }
  let vec1theta = Math.atan2(vec1.y, vec1.x)

  let dx = Ball.RADIUS * 2 * Math.cos(vec1theta)
  let dy = Ball.RADIUS * 2 * Math.sin(vec1theta)

  let p = {
    x: i.x + dx,
    y: i.y + dy,
  }

  return p
}

export function getCollisionLocation(ball, vec) {
  let walls = Table.PLAY_AREA.WALL_LINES
}
