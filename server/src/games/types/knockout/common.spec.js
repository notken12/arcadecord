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
import { LogOutput } from 'concurrently';

//ඞ

// CHANGE test.todo() TO test() WHEN READY TO TEST

// ok  ok ok ok ok ok ok okok okok o

test('set a direction for all dummies, complete a cycle and test if a dummy as fallen', async () => {
  let game = new main.Game();
  // Activate testing mode
  game.test();
  // Add fake players
  game.mockPlayers(2);

  // Initialize the game
  await game.init();

  let actions = [];

  actions.push(
    // player 1 sets
    new Action(
      'setDummies',
      {
        dummies: [
          { x: 30, y: 50, fallen: false, moveDir: { x: 1, y: 0 }, faceDir: 30 },
          {
            x: 40,
            y: 50,
            fallen: false,
            moveDir: { x: -5, y: 0 },
            faceDir: 80,
          },
          {
            x: 50,
            y: 50,
            fallen: false,
            moveDir: { x: -6, y: 0 },
            faceDir: 30,
          },
          {
            x: 60,
            y: 50,
            fallen: false,
            moveDir: { x: 7, y: 0 },
            faceDir: 120,
          },
          { x: 30, y: 70, fallen: false, moveDir: { x: 0, y: 0 }, faceDir: 30 },
          { x: 40, y: 70, fallen: false, moveDir: { x: 0, y: 0 }, faceDir: 80 },
          { x: 50, y: 70, fallen: false, moveDir: { x: 0, y: 0 }, faceDir: 30 },
          {
            x: 60,
            y: 70,
            fallen: false,
            moveDir: { x: 0, y: 0 },
            faceDir: 120,
          },
        ],
      },
      1
    )
  );
  actions.push(
    //player 0 sets
    new Action(
      'setDummies',
      {
        dummies: [
          { x: -5, y: 10, fallen: true, moveDir: { x: 1, y: 0 }, faceDir: 30 },
          {
            x: 40,
            y: 50,
            fallen: false,
            moveDir: { x: -5, y: 0 },
            faceDir: 80,
          },
          {
            x: 50,
            y: 50,
            fallen: false,
            moveDir: { x: -6, y: 0 },
            faceDir: 30,
          },
          {
            x: 60,
            y: 50,
            fallen: false,
            moveDir: { x: 7, y: 0 },
            faceDir: 120,
          },
          { x: 30, y: 80, fallen: false, moveDir: { x: 3, y: 0 }, faceDir: 30 },
          { x: 40, y: 30, fallen: false, moveDir: { x: 5, y: 0 }, faceDir: 80 },
          { x: 50, y: 70, fallen: false, moveDir: { x: 1, y: 0 }, faceDir: 30 },
          {
            x: 80,
            y: 20,
            fallen: false,
            moveDir: { x: 2, y: 0 },
            faceDir: 120,
          },
        ],
      },
      0
    )
  );
  actions.push(
    //player 0 sets
    new Action(
      'setDummies',
      {
        dummies: [
          { x: -5, y: 10, fallen: true, moveDir: { x: 0, y: 0 }, faceDir: 30 },
          { x: 40, y: 50, fallen: false, moveDir: { x: 0, y: 0 }, faceDir: 80 },
          { x: 50, y: 50, fallen: false, moveDir: { x: 0, y: 0 }, faceDir: 30 },
          {
            x: 60,
            y: 50,
            fallen: false,
            moveDir: { x: 0, y: 0 },
            faceDir: 120,
          },
          { x: 30, y: 80, fallen: false, moveDir: { x: 2, y: 0 }, faceDir: 30 },
          {
            x: 40,
            y: 30,
            fallen: false,
            moveDir: { x: 10, y: 0 },
            faceDir: 80,
          },
          {
            x: 50,
            y: 70,
            fallen: false,
            moveDir: { x: -3, y: 0 },
            faceDir: 30,
          },
          {
            x: 80,
            y: 20,
            fallen: false,
            moveDir: { x: 20, y: 0 },
            faceDir: 120,
          },
        ],
      },
      0
    )
  );

  actions.push(
    // player 1 sets
    new Action(
      'setDummies',
      {
        dummies: [
          { x: 30, y: 50, fallen: true, moveDir: { x: 1, y: 0 }, faceDir: 30 },
          {
            x: 40,
            y: 50,
            fallen: false,
            moveDir: { x: -5, y: 0 },
            faceDir: 80,
          },
          {
            x: 50,
            y: 50,
            fallen: false,
            moveDir: { x: -6, y: 0 },
            faceDir: 30,
          },
          {
            x: 60,
            y: 50,
            fallen: false,
            moveDir: { x: 7, y: 0 },
            faceDir: 120,
          },
          { x: 30, y: 70, fallen: false, moveDir: { x: 0, y: 0 }, faceDir: 30 },
          { x: 40, y: 70, fallen: false, moveDir: { x: 0, y: 0 }, faceDir: 80 },
          { x: 50, y: 70, fallen: false, moveDir: { x: 0, y: 0 }, faceDir: 30 },
          {
            x: 60,
            y: 70,
            fallen: false,
            moveDir: { x: 0, y: 0 },
            faceDir: 120,
          },
        ],
      },
      1
    )
  );
  actions.forEach(async (action) => await game.handleAction(action));
  expect(GameFlow.isItUsersTurn(game, 1)).toBe(true); // it should be player 1's turn
  expect(game.data.firing).toBe(true);
  expect(game.data.ice.size).toBe(90); // percent should have decreased
  expect(game.data.dummies[0].fallen).toBe(true);
});
test('player 0 wins', async () => {
  let game = new main.Game();
  // Activate testing mode
  game.test();
  // Add fake players
  game.mockPlayers(2);

  // Initialize the game
  await game.init();

  let actions = [];

  actions.push(
    // player 1 sets
    new Action(
      'setDummies',
      {
        dummies: [
          { x: 30, y: 50, fallen: false, moveDir: { x: 1, y: 0 }, faceDir: 30 },
          {
            x: 40,
            y: 50,
            fallen: false,
            moveDir: { x: -5, y: 0 },
            faceDir: 80,
          },
          {
            x: 50,
            y: 50,
            fallen: false,
            moveDir: { x: -6, y: 0 },
            faceDir: 30,
          },
          {
            x: 60,
            y: 50,
            fallen: false,
            moveDir: { x: 7, y: 0 },
            faceDir: 120,
          },
          { x: 30, y: 70, fallen: false, moveDir: { x: 0, y: 0 }, faceDir: 30 },
          { x: 40, y: 70, fallen: false, moveDir: { x: 0, y: 0 }, faceDir: 80 },
          { x: 50, y: 70, fallen: false, moveDir: { x: 0, y: 0 }, faceDir: 30 },
          {
            x: 60,
            y: 70,
            fallen: false,
            moveDir: { x: 0, y: 0 },
            faceDir: 120,
          },
        ],
      },
      1
    )
  );
  actions.push(
    //player 0 sets
    new Action(
      'setDummies',
      {
        dummies: [
          { x: -5, y: 10, fallen: true, moveDir: { x: 1, y: 0 }, faceDir: 30 },
          { x: 40, y: 50, fallen: true, moveDir: { x: -5, y: 0 }, faceDir: 80 },
          { x: 50, y: 50, fallen: true, moveDir: { x: -6, y: 0 }, faceDir: 30 },
          { x: 60, y: 50, fallen: true, moveDir: { x: 7, y: 0 }, faceDir: 120 },
          { x: 30, y: 80, fallen: false, moveDir: { x: 3, y: 0 }, faceDir: 30 },
          { x: 40, y: 30, fallen: false, moveDir: { x: 5, y: 0 }, faceDir: 80 },
          { x: 50, y: 70, fallen: false, moveDir: { x: 1, y: 0 }, faceDir: 30 },
          {
            x: 80,
            y: 20,
            fallen: false,
            moveDir: { x: 2, y: 0 },
            faceDir: 120,
          },
        ],
      },
      0
    )
  );

  actions.forEach(async (action) => await game.handleAction(action));
  // it should be player 1's turn
  expect(game.data.ice.size).toBe(95); // percent should have decreased
  expect(game.hasEnded).toBe(true);
  expect(game.data.firing).toBe(true);
  expect(game.data.dummies[0].x).toBe(-5);
});
