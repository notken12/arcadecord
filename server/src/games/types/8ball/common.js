// common.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Common action models

// Import GameFlow to control game flow

// tests if global scope is bound to window
import GameFlow from '../../GameFlow.js';

export const ballColors = [
  ['1ball', '2ball', '3ball', '4ball', '5ball', '6ball', '7ball'],
  ['9ball', '10ball', '11ball', '12ball', '13ball', '14ball', '15ball'],
];

class Table {
  static PLAY_AREA = {
    LEN_Z: 2.2352, // m
    LEN_X: 1.1176, // m
  };
}

class Ball {
  static RADIUS = 0.05715 / 2; // m
  static MASS = 0.17; // kg

  name;
  position = { x: 0, y: 0, z: 0 };
  quaternion = { x: 0, y: 0, z: 0, w: 1 };
  out = false;
  color;

  constructor(x, y, z, name, quaternion, out, color) {
    this.position.x = x ?? this.position.x;
    this.position.y = y ?? this.position.y;
    this.position.z = z ?? this.position.z;
    this.name = name ?? this.name;
    this.quaternion = quaternion ?? this.quaternion;
    this.out = out ?? this.out;
    this.color = color ?? 0xff0000;
    this.pocket = undefined;
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
    );
  }

  static DEFAULT_POSITION = {
    x: 0,
    y: Ball.RADIUS,
    z: (Table.PLAY_AREA.LEN_Z / 4) * -1,
  };
}

const lenx = Table.PLAY_AREA.LEN_X / 2;
const lenz = Table.PLAY_AREA.LEN_Z / 2;

const lenxm = lenx + Ball.RADIUS * 2.5;
const lenxc = lenx + Ball.RADIUS * 0.75;
const lenzc = lenz + Ball.RADIUS * 0.75;

const POCKETS = [
  // Top left
  { x: -lenxc, z: lenzc },
  // Top right
  { x: lenxc, z: lenzc },
  // Middle left
  { x: -lenxm, z: 0 },
  // Middle right
  { x: lenxm, z: 0 },
  // Bottom left
  { x: -lenxc, z: -lenzc },
  // Bottom right
  { x: lenxc, z: -lenzc },
];

export const ballsOverlap = (b1, b2) => {
  if (b1.out || b2.out) return false; // cant be overlapping if they're out
  if (b1.name === b2.name) return false;
  let dx = b1.position.x - b2.position.x;
  let dz = b1.position.z - b2.position.z;
  return Math.sqrt(dx ** 2 + dz ** 2) < Ball.RADIUS * 2;
};

async function shoot(game, action) {
  var continueTurn = false;
  var pattern = game.data.players[game.turn].assignedPattern;
  if (pattern !== null && pattern !== undefined) {
    // check if the assigned pattern hasn't been assigned yet
    if (checkHitIn(game, action, pattern)) {
      continueTurn = true;
    }
  } else {
    let didSolid = checkHitIn(game, action, 0);
    let didStriped = checkHitIn(game, action, 1);
    if (!(didSolid && didStriped)) {
      if (didSolid) {
        game.data.players[game.turn].assignedPattern = 0;
        game.data.players[[1, 0][game.turn]].assignedPattern = 1;
        continueTurn = true;
      } else if (didStriped) {
        game.data.players[[1, 0][game.turn]].assignedPattern = 0;
        game.data.players[game.turn].assignedPattern = 1;
        continueTurn = true;
      }
    }
  }

  let { newBallStates } = action.data;
  for (let b of newBallStates) {
    let ball = game.data.balls.find((ball) => ball.name === b.name);
    if (!ball) continue;
    Object.assign(ball, {
      out: b.out,
      position: b.position,
      quaternion: b.quaternion,
      pocket: b.pocket,
    });
  }

  let ball8 = game.data.balls.find((ball) => ball.name === '8ball');
  let cueball = game.data.balls.find((ball) => ball.name === 'cueball');

  if (game.data.cueFoul) game.data.cueFoul = false;

  const myInBalls = getBalls(game.data.balls, pattern, true);
  if (ball8.out) {
    if (pattern !== null && pattern !== undefined) {
    } else {
      // You shot the 8 ball in before you shot any other balls in because you dont have an assigned pattern
      await GameFlow.end(game, {
        winner: [1, 0][game.turn],
      });
      return game;
    }
    if (cueball.out) {
      // You knocked the 8ball and cue ball out. You lose.
      await GameFlow.end(game, {
        winner: [1, 0][game.turn],
      });
      game.data.players[game.turn].canHit8Ball = false;
      return game;
    } else if (myInBalls.length === 0) {
      if (ball8.pocket === action.data.chosenPocket) {
        // Woohoo, 8ball correctly pocketed!
        await GameFlow.end(game, {
          winner: game.turn,
        });
        game.data.players[game.turn].canHit8Ball = false;
        return game;
      } else {
        // Sad, 8ball was shot into the wrong pocket. You lose
        await GameFlow.end(game, {
          winner: [1, 0][game.turn],
        });
        game.data.players[game.turn].canHit8Ball = false;
        return game;
      }
    } else {
      // You shot in the 8 ball before knockout all other balls out.
      // You lose.
      await GameFlow.end(game, {
        winner: [1, 0][game.turn],
      });
      game.data.players[game.turn].canHit8Ball = false;
      return game;
    }
  } else {
    if (getBalls(game.data.balls, undefined, true).length <= 2) {
      // Less than 2 balls left: cue ball and 8 ball
      // Both players canHit8Ball
      for (let p of game.data.players) {
        p.canHit8Ball = true;
      }
    } else {
      // If you hit all of your balls in, you canHit8Ball
      for (let i = 0; i < game.players.length; i++) {
        let pattern = game.data.players[i].assignedPattern;
        if (pattern === null || pattern === undefined) continue;
        let playerInBalls = getBalls(game.data.balls, pattern, true);
        if (
          playerInBalls.length === 0 &&
          pattern !== null &&
          pattern !== undefined
        ) {
          game.data.players[i].canHit8Ball = true;
        }
      }
    }
  }

  if (cueball.out) {
    // Don't actually let the cue ball get out
    cueball.out = false;
    // Find valid position to put the cue ball (cant overlap with other balls)

    let tableEnd = Table.PLAY_AREA.LEN_Z / 2 - Ball.RADIUS;
    // Default position
    let position = { x: 0, y: Ball.RADIUS, z: 0 };

    // Repeatedly try to place ball further along the z axis
    for (let zo = 0; zo <= tableEnd; zo += Ball.RADIUS) {
      let invalid = false;
      for (let ball of game.data.balls) {
        if (ballsOverlap(cueball, ball)) {
          // Balls overlap, invalid. Keep searching
          invalid = true;
          break;
        }
      }
      if (invalid) continue;
      // Woohoo, no overlaps
      // Place the ball here
      position.z = zo;
      break;
    }
    cueball.position = position;
    cueball.quaternion = { x: 0, y: 0, z: 0, w: 1 }; // reset rotation

    game.data.cueFoul = true;
    await GameFlow.endTurn(game);
    return game;
  }

  if (!continueTurn) {
    await GameFlow.endTurn(game);
  }

  return game;
}

function getBalls(balls, pattern, onlyIn) {
  var yesBalls = [];
  for (let i = 0; i < balls.length; i++) {
    var pushBall = true;
    if (
      pattern !== undefined &&
      !ballColors[pattern]?.includes(balls[i].name)
    ) {
      pushBall = false;
    } else if (onlyIn && balls[i].out) {
      pushBall = false;
    }

    if (pushBall) {
      yesBalls.push(balls[i]);
    }
  }
  return yesBalls;
}

/** Check if a ball with a certain pattern was pocketed on this action */
function checkHitIn(game, action, pattern) {
  let oldBalls = getBalls(game.data.balls, pattern, true);
  let newBalls = getBalls(action.data.newBallStates, pattern, true);

  if (newBalls.length == oldBalls.length) {
    return false;
  } else {
    return true;
  }
}

export default {
  ballColors,
  Ball,
  CueBall,
  Table,
  shoot,
  getBalls,
  checkHitIn,
  POCKETS,
};
