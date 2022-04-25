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
      var i = index + !action.userId * 4;
      game.data.dummies[index] = new Dummy(
        setTo.x,
        setTo.y,
        setTo.faceDir,
        i,
        setTo.moveDir,
        setTo.fallen
      );
    }
  });
  if (game.data.firing == true) {
    game.data.firing = false;
    await GameFlow.endTurn(game);
  } else {
    game.data.firing = true;
  }

  var winner = checkWinner(game);
  game.data.winner = winner;
  game.data.ice.size -= Ice.decrease;

  game.data.player = [GameFlow.isItUsersTurn(game, 0), winner];
  if (winner) await GameFlow.end(game, { winner });

  return game;
}

function checkWinner(game) {
  var p1 = 0,
    p0 = 0,
    winner = undefined,
    cur;
  for (var i = 0; i < game.data.dummies.length; i++) {
    cur = game.data.dummies[i];
    if (!cur.fallen) continue; //stop for loop if hasn't fallen
    if (cur.playerIndex) p1++;
    //player index is either 0 or 1
    else p0++;
  }
  if (p1 == 4) winner = 1;
  else if (p0 == 4) winner = 0;
  else if (p1 == 4 && p0 == 4) winner = -1; // draw cause they can all fall
  return winner;
}

function spawn() {
  var ice = new Ice(),
    dummies = [],
    collision = (x1, y1, x2, y2) => (x2 - x1) ** 2 + (y2 - y1) ** 2 <= 10 ** 2,
    overlap,
    newd,
    i = 0;
  while (i < 8) {
    overlap = false;
    newd = new Dummy(
      randRange(10, 90),
      randRange(10, 90),
      randRange(0, 360),
      i < 4 ? 1 : 0
    );
    for (var j = 0; j < dummies.length; j++) {
      var other = dummies[j];
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
