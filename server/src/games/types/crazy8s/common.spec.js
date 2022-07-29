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
    // For piles: each card is encoded as 2 chars: {type}{number} and put in order into a string to represent the pile.
    // The top card of the pile is at the beginning of the string and the bottom is at the end
    hands: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cards: {
            type: 'string',
          },
        },
        required: ['cards'],
      },
    },
    drawPile: {
      type: 'string',
    },
    discardPile: {
      type: 'string',
    },
    /** Either "standard" or "reverse" */
    direction: {
      type: 'string',
    },
  },
  required: ['hands', 'drawPile', 'discardPile', 'direction'],
};

const validateGameState = ajv.compile(stateSchema);

test('initial game state', async () => {
  const game = new main.Game();
  game.test();

  game.mockPlayers(3);
  await game.init();
  await game.ready();

  const valid = validateGameState(game.data);
  expect(validateGameState.errors).toBe(null);
  expect(valid).toBe(true);
  // There are 108 cards in a deck of uno cards
  expect(Common.Card.decodeArray(game.data.drawPile).length).toBe(
    108 - 3 * 7 - 3
  );
  expect(Common.Card.decodeArray(game.data.hands[0].cards).length).toBe(7);
  expect(Common.Card.decodeArray(game.data.hands[1].cards).length).toBe(7);
  expect(Common.Card.decodeArray(game.data.hands[2].cards).length).toBe(7);

  // expecting cards in discard to be 1 already
  expect(Common.Card.decodeArray(game.data.discardPile).length).toBe(3);
  expect(game.data.discardPile).toBe('_r6!sg0@sg0!');

  const action = new Action(
    'place',
    {
      index: 1,
    },
    0
  );
  expect(await game.handleAction(action)).toEqual({ success: true });

  // epecting cards in hand to be 6
  expect(Common.Card.decodeArray(game.data.hands[0].cards).length).toBe(6);

  // expecting cards in discard to be 4
  expect(Common.Card.decodeArray(game.data.discardPile).length).toBe(4);

  // Expecting the turn to be the next player's
  expect(game.turn).toBe(1);
  console.log(game.data);

  // create new action draw to allow player to draw from pile
  const draw = new Action('draw', {}, 1);
  expect(await game.handleAction(draw)).toEqual({ success: true });
  expect(Common.Card.decodeArray(game.data.hands[1]).length).toBe(8);
  expect(game.turn).toBe(1);

  // create new action end turn to end players turn after they draw
  const end_turn = new Action('end_turn', {}, 1);
  
  expect(await game.handleAction(end_turn)).toEqual({ success: true });
  expect(Common.Card.decodeArray(game.data.hands[1]).length).toBe(8);
  expect(game.turn).toBe(2);

  // // second player plays skip
  // const skip = new Action(
  //   'place',
  //   {
  //     index: 5,
  //   },
  //   1
  // );

  // // expect it to be a valid action
  // expect(await game.handleAction(skip)).toEqual({ success: true });

  // // expect the turn to be a skip, normally in a turn ot would be player 2, but it goes back to player 0
  // expect(game.turn).toBe(0);

  // // epecting cards in hand to be 6
  // expect(Common.Card.decodeArray(game.data.hands[0].cards).length).toBe(6);

  // // expecting cards in discard to be 5
  // expect(Common.Card.decodeArray(game.data.discardPile).length).toBe(5);
});
