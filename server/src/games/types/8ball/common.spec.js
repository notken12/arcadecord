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

import Common from './common.js';
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js';

import Ajv from 'ajv';
const ajv = new Ajv();

// https://jestjs.io/docs/asynchronous

const stateSchema = {
  type: 'object',
  properties: {
    balls: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string', // 8ball, 1ball, 9ball, cueball
          },
          position: {
            type: 'object',
            properties: {
              x: {
                type: 'number',
              },
              y: {
                type: 'number',
              },
              z: {
                type: 'number',
              },
            },
            required: ['x', 'y', 'z'],
          },
          quaternion: {
            type: 'object',
            properties: {
              x: {
                type: 'number',
              },
              y: {
                type: 'number',
              },
              z: {
                type: 'number',
              },
              w: {
                type: 'number',
              },
            },
            required: ['x', 'y', 'z', 'w'],
          },
          out: {
            type: 'boolean',
          },
          color: {
            type: ['number', 'null'],
          },
        },
      },
      minItems: 16,
      maxItems: 16,
    },
    players: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          assignedPattern: {
            type: ['number', 'null'], // 0 for solid, 1 for striped, leave empty for unassigned yet
          },
          chosenPocket: {
            type: ['number', 'null'], // chosen pocket for when they shoot the 8 ball
          },
        },
      },
      maxItems: 2,
      minItems: 2,
    },
  },
  required: ['balls', 'players'],
};

const validateGameState = ajv.compile(stateSchema);

test('Initial 8ball game state', () => {
  // Create a new game
  let game = new main.Game();
  // Activate testing mode
  game.test();
  // Add fake players
  game.mockPlayers(2);

  // Initialize the game
  game.init();

  const valid = validateGameState(game.data);
  expect(game.data.balls.length).toEqual(16);
  expect(valid).toBe(true);

  expect(game.players[0].assignedPattern).toBe(undefined);
  expect(game.players[1].assignedPattern).toBe(undefined);
  expect(game.players[0].chosenPocket).toBe(undefined);
  expect(game.players[1].chosenPocket).toBe(undefined);
});

describe('8ball Action: shoot', () => {
  test('End turn if no ball is shot into pocket', async () => {
    // Create a new game
    let game = new main.Game();
    // Activate testing mode
    game.test();
    // Add fake players
    game.mockPlayers(2);

    // Initialize the game
    await game.init();

    // Define the actions to be made

    let newBallStates = game.data.balls;
    let missedShot = new Action(
      'shoot',
      {
        angle: Math.PI / 2, // radians, for UI
        force: 10, // for UI
        newBallStates: newBallStates,
      },
      1
    );

    // Run the actions
    expect(await game.handleAction(missedShot)).toEqual({ success: true });

    // Check the game state
    const valid = validateGameState(game.data);
    expect(valid).toBe(true);

    let stillTheirTurn = GameFlow.isItUsersTurn(game, 1);
    expect(stillTheirTurn).toBe(false);
  });

  test('Do not end turn if ball is shot into pocket', async () => {
    // Create a new game
    let game = new main.Game();
    // Activate testing mode
    game.test();
    // Add fake players
    game.mockPlayers(2);

    // Initialize the game
    await game.init();

    // Define the actions to be made

    let newBallStates = JSON.parse(JSON.stringify(game.data.balls));

    newBallStates[1].out = true;
    let missedShot = new Action(
      'shoot',
      {
        angle: Math.PI / 2, // radians, for UI
        force: 10, // for UI
        newBallStates: newBallStates,
      },
      1
    );

    // Run the actions
    expect(Common.getBalls(game.data.balls, 1, true).length).toBe(7);
    expect(Common.getBalls(missedShot.data.newBallStates, 1, true).length).toBe(
      6
    );
    expect(Common.checkHitIn(game, missedShot, 1)).toBe(true);

    expect(await game.handleAction(missedShot)).toEqual({ success: true });

    // Check the game state
    const valid = validateGameState(game.data);
    expect(valid).toBe(true);

    expect(Common.getBalls(game.data.balls, 1, true).length).toBe(6);

    expect(game.turn).toBe(1);
    let stillTheirTurn = GameFlow.isItUsersTurn(game, 1);
    expect(stillTheirTurn).toBe(true);
  });

  test("Set player's assigned color", async () => {
    // Create a new game
    let game = new main.Game();
    // Activate testing mode
    game.test();
    // Add fake players
    game.mockPlayers(2);

    // Initialize the game
    await game.init();

    // Define the actions to be made
    let newBallStates = JSON.parse(JSON.stringify(game.data.balls));

    newBallStates[1].out = true;
    let shot = new Action(
      'shoot',
      {
        angle: Math.PI / 2, // radians, for UI
        force: 10, // for UI
        newBallStates: newBallStates,
      },
      1
    );
    // Run the actions
    expect(Common.checkHitIn(game, shot, 1)).toBe(true);
    expect(await game.handleAction(shot)).toEqual({ success: true });

    // Check the game state

    expect(game.data.players[1].assignedPattern).toBe(1);
    expect(game.data.players[0].assignedPattern).toBe(0);
  });

  test('Lose game if player shoots 8 ball in pocket prematurely', async () => {
    // Create a new game
    let game = new main.Game();
    // Activate testing mode
    game.test();
    // Add fake players
    game.mockPlayers(2);

    // Initialize the game
    await game.init();

    game.data.players[1].assignedPattern = 1;

    let newBallStates = JSON.parse(JSON.stringify(game.data.balls));

    newBallStates[5].out = true;

    var shot = new Action(
      'shoot',
      {
        angle: Math.PI / 2, // radians, for UI
        force: 10, // for UI
        newBallStates: newBallStates,
      },
      1
    );
    //Tests
    expect(await game.handleAction(shot)).toEqual({ success: true });
    //  expect(await Common.shoot(game, shot)).toEqual("aw")

    expect(game.hasEnded).toBe(true);
    expect(game.winner).toBe(0);
  });

  test('Correctly pocketed 8 ball wins game', async () => {
    // Create a new game
    let game = new main.Game();
    // Activate testing mode
    game.test();
    // Add fake players
    game.mockPlayers(2);

    // Initialize the game
    await game.init();

    var newBallStates = JSON.parse(JSON.stringify(game.data.balls));

    newBallStates[1].out = true;
    newBallStates[3].out = true;
    newBallStates[4].out = true;
    newBallStates[8].out = true;
    newBallStates[10].out = true;
    newBallStates[11].out = true;
    newBallStates[13].out = true;

    var shot = new Action(
      'shoot',
      {
        angle: Math.PI / 2, // radians, for UI
        force: 10, // for UI
        newBallStates: newBallStates,
      },
      1
    );

    expect(await game.handleAction(shot)).toEqual({ success: true });

    expect(Common.getBalls(game.data.balls, 1, true).length).toBe(0);

    newBallStates[5].out = true;
    newBallStates[5].pocket = 1;

    var secondShot = new Action(
      'shoot',
      {
        angle: Math.PI / 2,
        force: 10,
        newBallStates: newBallStates,
        chosenPocket: 1,
      },
      1
    );

    expect(await game.handleAction(secondShot)).toEqual({ success: true });
    expect(game.hasEnded).toBe(true);
    expect(game.winner).toBe(1);
  });
  test('Wrong pocketed 8 ball loses game', async () => {
    // Create a new game
    let game = new main.Game();
    // Activate testing mode
    game.test();
    // Add fake players
    game.mockPlayers(2);

    // Initialize the game
    await game.init();

    var newBallStates = JSON.parse(JSON.stringify(game.data.balls));

    newBallStates[1].out = true;
    newBallStates[3].out = true;
    newBallStates[4].out = true;
    newBallStates[8].out = true;
    newBallStates[10].out = true;
    newBallStates[11].out = true;
    newBallStates[13].out = true;

    var shot = new Action(
      'shoot',
      {
        angle: Math.PI / 2, // radians, for UI
        force: 10, // for UI
        newBallStates: newBallStates,
      },
      1
    );

    expect(await game.handleAction(shot)).toEqual({ success: true });

    expect(Common.getBalls(game.data.balls, 1, true).length).toBe(0);

    newBallStates[5].out = true;
    newBallStates[5].pocket = 1;

    var secondShot = new Action(
      'shoot',
      {
        angle: Math.PI / 2,
        force: 10,
        newBallStates: newBallStates,
        chosenPocket: 2,
      },
      1
    );

    expect(await game.handleAction(secondShot)).toEqual({ success: true });
    expect(game.hasEnded).toBe(true);
    expect(game.winner).toBe(0);
  });

  test('Lose game if player shoots 8 ball and cue ball in the pocket at the same time', async () => {
    // Create a new game
    let game = new main.Game();
    // Activate testing mode
    game.test();
    // Add fake players
    game.mockPlayers(2);

    // Initialize the game
    await game.init();

    var newBallStates = JSON.parse(JSON.stringify(game.data.balls));

    (newBallStates[1].out = true),
      (newBallStates[3].out = true),
      (newBallStates[4].out = true),
      (newBallStates[8].out = true),
      (newBallStates[10].out = true),
      (newBallStates[11].out = true),
      (newBallStates[13].out = true);

    var shot = new Action(
      'shoot',
      {
        angle: Math.PI / 2, // radians, for UI
        force: 10, // for UI
        newBallStates: newBallStates,
      },
      1
    );

    expect(await game.handleAction(shot)).toEqual({ success: true });

    expect(Common.getBalls(game.data.balls, 1, true).length).toBe(0);

    newBallStates[5].out = true;
    newBallStates[0].out = true;
    newBallStates[5].pocket = 1;
    game.data.players[1].chosenPocket = 1;

    var secondShot = new Action(
      'shoot',
      {
        angle: Math.PI / 2,
        force: 10,
        newBallStates: newBallStates,
      },
      1
    );

    expect(await game.handleAction(secondShot)).toEqual({ success: true });
    expect(game.hasEnded).toBe(true);
    expect(game.winner).toBe(0);
  });

  test('Give cueball in hand if cueball is pocketed', async () => {
    // Create a new game
    let game = new main.Game();
    // Activate testing mode
    game.test();
    // Add fake players
    game.mockPlayers(2);

    // Initialize the game
    await game.init();

    var newBallStates = JSON.parse(JSON.stringify(game.data.balls));

    newBallStates[0].out = true;

    var shot = new Action(
      'shoot',
      {
        angle: Math.PI / 2, // radians, for UI
        force: 10, // for UI
        newBallStates: newBallStates,
      },
      1
    );

    expect(await game.handleAction(shot)).toEqual({ success: true });

    expect(game.data.cueFoul).toBe(true);

    let cueBall = game.data.balls[0];
    expect(cueBall.out).toBe(false);

    let stillTheirTurn = GameFlow.isItUsersTurn(game, 1);
    expect(stillTheirTurn).toBe(false);
  });
});
