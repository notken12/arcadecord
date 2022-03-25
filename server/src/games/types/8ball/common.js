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
  quaternion = { x: 0, y: 0, z: 0, w: 1 }
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
    this.pocket = undefined
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
      0xffffff,
      undefined
    )
  }

  static DEFAULT_POSITION = {
    x: 0,
    y: Ball.RADIUS,
    z: (Table.PLAY_AREA.LEN_Z / 4) * -1,
  }
}

async function shoot(game, action) {
  let continueTurn = false
  let pattern = game.data.players[game.turn].assignedPattern
  if (pattern === null || pattern === undefined) {
    // check if the assigned pattern hasn't been asssigned yet
    if (checkHitIn(game, action, pattern)) {
      continueTurn = true
    }
  } else {
    let didSolid = checkHitIn(game, action, 0)
    let didStriped = checkHitIn(game, action, 1)
    if (!(didSolid && didStriped)) {
      if (didSolid) {
        game.data.players[game.turn].assignedPattern = 0
        game.data.players[[1, 0][game.turn]].assignedPattern = 1
        continueTurn = true
      } else if (didStriped) {
        game.data.players[[1, 0][game.turn]].assignedPattern = 0
        game.data.players[game.turn].assignedPattern = 1
        continueTurn = true
      }
    }
  }
  game.data.balls = action.data.newBallStates

  let ball8 = game.data.balls.find((ball) => ball.name === '8ball')
  let cueball = game.data.balls.find((ball) => ball.name === 'cueball')

  if (game.data.cueFoul) game.data.cueFoul = false

  if (ball8.out) {
    if (cueball.out) {
      await GameFlow.end(game, {
        winner: [1, 0][game.turn],
      })
      game.data.players[game.turn].chosenPocket = undefined
      return game
    } else if (myInBalls.length == 0) {
      if (ball8.pocket == game.data.players[game.turn].chosenPocket) {
        await GameFlow.end(game, {
          winner: game.turn,
        })
        game.data.players[game.turn].chosenPocket = undefined
        return game
      } else {
        await GameFlow.end(game, {
          winner: [1, 0][game.turn],
        })
        game.data.players[game.turn].chosenPocket = undefined
        return game
      }
    } else {
      await GameFlow.end(game, {
        winner: [1, 0][game.turn],
      })
      game.data.players[game.turn].chosenPocket = undefined
      return game
    }
  }

  if (cueball.out) {
    game.data.cueFoul = true
    await GameFlow.endTurn(game)
    return game
  }

  if (game.data.players[game.turn].chosenPocket)
    game.data.players[game.turn].chosenPocket = undefined

  if (!continueTurn) {
    await GameFlow.endTurn(game)
  }

  return game
}

function getBalls(balls, color, onlyIn) {
  function ballFilter(ball) {
    if (ball.color == color) {
      if (onlyIn) {
        if (!ball.out) return true
        return false
      }
      return true
    }
  }
  let fetchedBalls = balls.filter(ballFilter)

  return fetchedBalls
}
function checkHitIn(game, action, color) {
  let oldBalls = getBalls(game.data.balls, color, true)
  let newBalls = getBalls(action.data.newBallStates, color, true)

  if (newBalls.length == oldBalls.length) {
    return false
  } else {
    return true
  }
}

export default {
  Ball,
  CueBall,
  Table,
  shoot,
  getBalls,
  checkHitIn,
}
