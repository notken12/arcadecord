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
          /// Whether the player has drawn a card in their current turn. Players may only pass if they have drawn a card
          drawn: {
            type: 'boolean',
          },
        },
        required: ['cards', 'drawn'],
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
  await game.readyAllPlayers();

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

  // create new action end turn to end players turn after they draw
  const end_turn = new Action('endTurn', {}, 1);
  // Ending turn should be an invalid action because the player has not drawn a card yet
  expect((await game.handleAction(end_turn)).success).toBe(false);

  // create new action draw to allow player to draw from pile
  const draw = new Action('draw', {}, 1);
  expect(await game.handleAction(draw)).toEqual({ success: true });
  expect(Common.Card.decodeArray(game.data.hands[1].cards).length).toBe(8);
  expect(game.turn).toBe(1);
  // Hand should have a "drawn" flag to allow the player to end their turn
  expect(game.data.hands[1].drawn).toBe(true);
  // Draw pile should have one less card in it
  expect(Common.Card.decodeArray(game.data.drawPile).length).toBe(
    108 - 3 * 7 - 3 - 1
  );

  // Ending turn should now be a valid action because the player has drawn a card
  expect(await game.handleAction(end_turn)).toEqual({ success: true });
  // Hand should remain the same
  expect(Common.Card.decodeArray(game.data.hands[1].cards).length).toBe(8);
  // Should be next player's turn
  expect(game.turn).toBe(2);
  // Reset "drawn" flag to false
  expect(game.data.hands[1].drawn).toBe(false);


  console.log(game.data);


  // new action of player 2 playing a red +2
  const plustwo = new Action('place', { index: 2 }, 2);
  expect(await game.handleAction(plustwo)).toEqual({ success: true });

  // epecting cards in hand to be 6
  expect(Common.Card.decodeArray(game.data.hands[2].cards).length).toBe(6);

  // expecting cards in discard to be 5
  expect(Common.Card.decodeArray(game.data.discardPile).length).toBe(5);

  // Expecting the turn to be the next player (player 0)
  expect(game.turn).toBe(0);

  // expecting cards in player 0's hand to be 8 (current 6 plus the draw of 2)
  expect(Common.Card.decodeArray(game.data.hands[0]).length).toBe(8);

  // expect draw pile length minus two cards drawn
  expect(Common.Card.decodeArray(game.data.drawPile).length).toBe(
    108 - 3 * 7 - 3 - 1 - 2
  );


  // expecting turn to be player 1
  expect(game.turn).toBe(1);

  // have player 1 play a reverse 
  const reverse = new Action('place', { index: 7 }, 1);
  expect(await game.handleAction(reverse)).toEqual({ success: true });

  // expect cards in player 1 hand be 7 (8 -1)
  expect(Common.Card.decodeArray(game.data.hands[1]).length).toBe(7);

  // expecting cards in discard to be 6
  expect(Common.Card.decodeArray(game.data.discardPile).length).toBe(6);

  // reverse order having player 0 play again
  expect(game.turn).toBe(0);

  // player 0 playing blue draw 2 (plus 2)
  plustwo = new Action('place', { index: 4 }, 0);
  expect(await game.handleAction(plustwo)).toEqual({ success: true });

  // expect player 0 to have 7 cards (current 8-1)
  expect(Common.Card.decodeArray(game.data.hands[0]).length).toBe(7);

  // expecting cards in discard to be 7
  expect(Common.Card.decodeArray(game.data.discardPile).length).toBe(7);

  // expect it to be player 2 turn since reverse continues
  expect(game.turn).toBe(2);

  // have player 2 draw 2 cards (expect current 6 + 2)
  expect(Common.Card.decodeArray(game.data.hands[2]).length).toBe(8);

  // expect draw pile length minus two cards drawn
  expect(Common.Card.decodeArray(game.data.drawPile).length).toBe(
    108 - 3 * 7 - 3 - 1 - 2 - 2
  );

  // expect it to be player 1 turn, reverse continues
  expect(game.turn).toBe(1);

  // player 1 plays blue skip
  const skip = new Action(
    'place',
    {
      index: 5,
    },
    1
  );

  // expect it to be a valid action
  expect(await game.handleAction(skip)).toEqual({ success: true });

  // expecting cards in hand to be 6 (7-1)
  expect(Common.Card.decodeArray(game.data.hands[1].cards).length).toBe(6);

  // expecting cards in discard to be 8
  expect(Common.Card.decodeArray(game.data.discardPile).length).toBe(8);

  // expect the turn to be a skip, normally in a turn it would be player 2, but it goes back to player 0
  expect(game.turn).toBe(0);
});
