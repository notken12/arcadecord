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

  const valid = validateGameState(game.data);
  console.log(game.data);
  expect(validateGameState.errors).toBe(null);
  expect(valid).toBe(true);
  // There are 108 cards in a deck of uno cards
  expect(Common.Card.decodeArray(game.data.drawPile).length).toBe(108 - 3 * 7);
});
