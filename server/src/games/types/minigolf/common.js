// common.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import GameFlow from '../../GameFlow.js';

import { GOLF_MAPS } from './maps.js';

async function stroke(game, event) {
  let ball = game.data.ball;
  let strokeData = event.data.force;

  ball.x = strokeData.x;
  ball.y = strokeData.y;

  return game;
}

export default {
  stroke,
};
