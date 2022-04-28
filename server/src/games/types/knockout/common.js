// common.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import GameFlow from '../../GameFlow.js';

class Dummy {
  constructor(x, y, faceDir, playerIndex, moveDir, fallen) {
    this.x = x; //x and y relative to ice size
    this.y = y;
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.moveDir = moveDir || undefined; //vector
    this.faceDir = faceDir; //angle in degrees
    this.playerIndex = playerIndex;
    this.fallen = fallen || false;
  }
}

class Ice {
  static decrease = 5;
  constructor(size) {
    this.size = size || 100;
  }
}

async function setDummies(game, action) {
  action.data.dummies.forEach((setTo, index) => {
    if (setTo) {
      var dummyPlayerIndex = index < 4 ? 1 : 0;
      game.data.dummies[index] = new Dummy(
        setTo.x,
        setTo.y,
        setTo.faceDir,
        dummyPlayerIndex,
        setTo.moveDir,
        setTo.fallen
      );
    }
  });

  // Make sure the action thinks its firing if it's firing
  // Useful distinction for replaying, don't need to check game state
  if (game.data.firing !== action.data.firing) return false;

  game.data.firing = !game.data.firing;

  if (game.data.firing) {
    // Now firing, this action set the positions only
    await GameFlow.endTurn(game);
    return game;
  } else {
    // Now not firing, this action fired
    // Reset move directions
    for (let dum of game.data.dummies) {
      dum.moveDir = null;
    }
  }

  // if (game.data.firstTurn) {
  //   game.data.firstTurn = false;
  //   await GameFlow.endTurn(game);
  //   return game;
  // }

  var winner = checkWinner(game);
  game.data.winner = winner;
  game.data.ice.size -= Ice.decrease;

  // game.data.player = [GameFlow.isItUsersTurn(game, 0), winner];
  if (winner !== null) await GameFlow.end(game, { winner });

  return game;
}

function checkWinner(game) {
  let seen = null;
  for (let i = 0; i < game.data.dummies.length; i++) {
    let dum = game.data.dummies[i];
    if (!dum.fallen) {
      if (seen === null) {
        // Winner hasn't been set
        seen = dum.playerIndex;
      } else if (seen !== dum.playerIndex) {
        // We saw non-fallen dummy that belongs to a different player before
        // Thus we have dummies from both players that are not fallen
        // Game is inconclusive
        return null;
      }
    }
  }
  if (seen === null) {
    // No non-fallen dummies were seen
    // All dummies are fallen
    // Draw
    return -1;
  }
  // Only dummies that belong to 1 player were seen
  // That player wins
  return seen;
}

const collision = (x1, y1, x2, y2) =>
  (x2 - x1) ** 2 + (y2 - y1) ** 2 <= 10 ** 2;

function spawn() {
  let ice = new Ice(),
    dummies = [],
    overlap,
    i = 0;
  while (i < 8) {
    overlap = false;
    let newd = new Dummy(
      randRange(10, 90),
      randRange(10, 90),
      randRange(0, 2 * Math.PI),
      i < 4 ? 1 : 0
    );
    for (let j = 0; j < dummies.length; j++) {
      let other = dummies[j];
      overlap = collision(other.x, other.y, newd.x, newd.y);
      if (overlap) break;
    }
    if (!overlap || i == 0) {
      dummies.push(newd);
      i++;
    }
  }
  return { ice, dummies };
}

function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default { Ice, Dummy, setDummies, spawn };
