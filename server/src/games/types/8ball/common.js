// Common action models

// Import GameFlow to control game flow

// tests if global scope is bound to window
import GameFlow from '../../GameFlow.js'

class Table {
  static PLAY_AREA = {
    LEN_Z: 2.2352, // m
    LEN_X: 1.1176, // m
  }
}

class Ball {
  static RADIUS = 0.05715 / 2 // m
  static MASS = 0.17 // kg

  name
  position = { x: 0, y: 0, z: 0 }
  quaternion = { x: 0, y: 0, z: 0, w: 0 }
  out = false
  color

  constructor(x, y, z, name, quaternion, out, color) {
    this.position.x = x ?? this.position.x
    this.position.y = y ?? this.position.y
    this.position.z = z ?? this.position.z
    this.name = name ?? this.name
    this.quaternion = quaternion ?? this.quaternion
    this.out = out ?? this.out
    this.color = color ?? 0xff0000
  }
}

export class CueBall extends Ball {
  constructor(x, y, z) {
    super(
      x || CueBall.DEFAULT_POSITION.x,
      y || CueBall.DEFAULT_POSITION.y,
      z || CueBall.DEFAULT_POSITION.z,
      'cueball',
      undefined,
      undefined,
      0xffffff
    )
  }

  static DEFAULT_POSITION = {
    x: 0,
    y: Ball.RADIUS,
    z: (Table.PLAY_AREA.LEN_Z / 4) * -1,
  }
}

async function shoot(game, action){
  let balls = game.data.balls;
}

function getBalls(game, color, onlyIn){
  let balls = game.data.balls;
  let fetchedBalls = balls.filter(ball => ball.color === color && (onlyIn && !ball.out))

  return fetchedBalls;
}

export default {
  Ball,
  CueBall,
  Table,
  shoot,
  getBalls
}
