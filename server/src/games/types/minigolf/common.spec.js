// common.spec.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { expect, test, describe } from 'vitest';
// Import the main module for this game type
import main from './main.js';
// Import the Action class to make actions
import Action from '../../Action.js';
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js';
import Common from './common.js';

// https://jestjs.io/docs/asynchronous
test.todo('holes setting works properly', async () => {
  // Create a new game
  let game = new main.Game({ settings: { holes: 3 } });
  // Activate testing mode
  game.test();
  // Add fake players
  game.mockPlayers(2);

  // Initialize the game
  await game.init();

  expect(game.settings.holes).toBe(3);
});

test.todo('', async () => {});
