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

// https://jestjs.io/docs/asynchronous

test('50 moves without pawn moves or captures will result in a draw', async () => {
  // Create a new game
  let game = new main.Game();
  // Activate testing mode
  game.test();
  // Add fake players
  game.mockPlayers(2);

  // Initialize the game
  await game.init();

  // Define the actions to be made
  // new Action(type, data, userId)

  // Run the actions
  for (let i = 0; i < 50; i++) {
    for (let p = 1; p >= 0; p--) {
      let oddMove = (i + 1) % 2 === 1;
      let fromFile = 1;
      let fromRank = p === 1 ? 0 : 7;
      let toFile = 0;
      let toRank = p === 1 ? 2 : 5;

      let action = new Action(
        'movePiece',
        {
          move: {
            from: oddMove ? [fromFile, fromRank] : [toFile, toRank],
            to: oddMove ? [toFile, toRank] : [fromFile, fromRank],
            pieceType: 'n',
          },
        },
        p
      );

      await game.handleAction(action);
    }
  }

  // Assertions
  expect(game.hasEnded).toBe(true);
  expect(game.winner).toBe(-1);
});

test.todo('50 moves with a pawn move should not result in a draw', async () => {
  // Create a new game
  let game = new main.Game();
  // Activate testing mode
  game.test();
  // Add fake players
  game.mockPlayers(2);

  // Initialize the game
  await game.init();

  // Define the actions to be made
  // new Action(type, data, userId)

  // Run the actions
  for (let i = 0; i < 40; i++) {
    for (let p = 1; p >= 0; p--) {
      let oddMove = (i + 1) % 2 === 1;
      let fromFile = 1;
      let fromRank = p === 1 ? 0 : 7;
      let toFile = 0;
      let toRank = p === 1 ? 2 : 5;

      let action = new Action(
        'movePiece',
        {
          move: {
            from: oddMove ? [fromFile, fromRank] : [toFile, toRank],
            to: oddMove ? [toFile, toRank] : [fromFile, fromRank],
            pieceType: 'n',
          },
        },
        p
      );

      await game.handleAction(action);
    }
  }

  let pawnMove = new Action(
    'movePiece',
    {
      move: {
        from: [4, 1],
        to: [4, 2],
        pieceType: 'p',
        double: false,
      },
    },
    1
  );
  let pawnMoveBlack = new Action(
    'movePiece',
    {
      move: {
        from: [4, 6],
        to: [4, 5],
        pieceType: 'p',
        double: false,
      },
    },
    0
  );

  expect(game.winner).toBe(1);
  expect(game.hasEnded).toBe(false);
  console.log(game.data.board.find((p) => p.file === 4 && p.rank === 1));
  expect(game.turn).toEqual(1);
  expect(await game.handleAction(pawnMove)).toEqual({ success: true });
  expect(await game.handleAction(pawnMoveBlack)).toEqual({ success: true });

  // Assertions
  expect(game.hasEnded).toBe(false);
});

test('Insufficient material will result in a draw', async () => {
  // Create a new game
  let game = new main.Game();
  // Activate testing mode
  game.test();
  // Add fake players
  game.mockPlayers(2);

  // Initialize the game
  await game.init();

  // Delete all pieces but kings
  game.data.board = game.data.board.filter((p) => p.type === 'k');

  // Define the actions to be made
  // new Action(type, data, userId)
  let move = new Action(
    'movePiece',
    {
      move: {
        pieceType: 'k',
        from: [4, 0],
        to: [4, 1],
      },
    },
    1
  );

  // Run the actions
  await game.handleAction(move);

  // Assertions
  expect(game.hasEnded).toBe(true);
  expect(game.winner).toBe(-1);
});
