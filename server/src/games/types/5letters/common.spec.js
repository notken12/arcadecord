import { expect, test, describe } from 'vitest'
// common.spec.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'

import Ajv from 'ajv'
const ajv = new Ajv()

const stateSchema = {
  type: 'object',
  properties: {
    answers: {
      type: 'array',
      items: {
        type: 'string',
      },
      maxItems: 2,
    },
    guesses: {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            hints: {
              type: 'array',
              items: {
                type: 'number',
              },
              maxItems: 5,
            },
            word: {
              type: 'string',
            },
          },
          required: ['hints', 'word'],
        },
        maxItems: 6,
      },
      maxItems: 2,
      minItems: 2,
    },
  },
  required: ['answers', 'guesses'],
}

const validateGameState = ajv.compile(stateSchema)

test('initial game state', async () => {
  // Create a new game
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  game.init()

  const valid = validateGameState(game.data)
  expect(valid).toBe(true)
})

describe('Action: choose word', async () => {
  test('choosing word ends turn for player 1 but not for player 0', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    game.init()

    // Choose a word
    let action = new Action(
      'chooseWord',
      {
        word: 'mango',
      },
      1
    )
    await game.handleAction(action)

    // Check that the word was chosen
    expect(game.data.answers[1]).toEqual('mango')
    // Check that the turn ended
    expect(GameFlow.isItUsersTurn(game, 1)).toEqual(false)

    let action2 = new Action(
      'chooseWord',
      {
        word: 'apple',
      },
      0
    )

    await game.handleAction(action2)

    // Check that the word was chosen
    expect(game.data.answers[0]).toEqual('apple')
    // Check that it's still player 0's turn
    expect(GameFlow.isItUsersTurn(game, 0)).toEqual(true)
  })

  test('Words that arent in the word list arent allowed', async () => {
    let game = new main.Game()
    game.test()
    game.mockPlayers(2)
    game.init()

    let action = new Action(
      'chooseWord',
      {
        word: 'fjeow',
      },
      1
    )

    let result = await game.handleAction(action)
    expect(result.success).toEqual(false)
  })
})

describe('Action: guess', async () => {
  test('player wins when guessing correctly', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    game.init()

    // Player 1 chooses a word
    let action = new Action(
      'chooseWord',
      {
        word: 'mango',
      },
      1
    )
    await game.handleAction(action)

    // Player 0 chooses a word
    let action2 = new Action(
      'chooseWord',
      {
        word: 'apple',
      },
      0
    )
    await game.handleAction(action2)

    // Player 0 guesses the word
    let action3 = new Action(
      'guess',
      {
        word: 'mango',
      },
      0
    )
    await game.handleAction(action3)

    // Player 1 makes a wrong guess
    let action4 = new Action(
      'guess',
      {
        word: 'crate',
      },
      1
    )
    await game.handleAction(action4)

    // Check that the player won
    expect(game.hasEnded).toEqual(true)

    expect(game.winner).toEqual(0)
  })
  test('a draw happens if both players cant guess the others word', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    game.init()

    // Player 1 chooses a word
    let action = new Action(
      'chooseWord',
      {
        word: 'mango',
      },
      1
    )
    await game.handleAction(action)

    // Player 0 chooses a word
    let action2 = new Action(
      'chooseWord',
      {
        word: 'apple',
      },
      0
    )
    await game.handleAction(action2)

    let badGuess0 = new Action(
      'guess',
      {
        word: 'crate',
      },
      0
    )
    let badGuess1 = new Action(
      'guess',
      {
        word: 'crate',
      },
      1
    )

    for (let i = 0; i < 6; i++) {
      await game.handleAction(badGuess0)
      await game.handleAction(badGuess1)
    }

    // Check that the game ended
    expect(game.data.guesses[0].length).toEqual(6)
    expect(game.data.guesses[1].length).toEqual(6)
    expect(game.hasEnded).toEqual(true)
    expect(game.winner).toEqual(-1)
  })
  test('turn ends after player guesses', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    game.init()

    // Player 1 chooses a word
    let action = new Action(
      'chooseWord',
      {
        word: 'mango',
      },
      1
    )
    await game.handleAction(action)

    // Player 0 chooses a word
    let action2 = new Action(
      'chooseWord',
      {
        word: 'apple',
      },
      0
    )
    await game.handleAction(action2)

    // Player 0 guesses the word
    let action3 = new Action(
      'guess',
      {
        word: 'mango',
      },
      0
    )
    await game.handleAction(action3)

    // Check that the turn ended
    expect(GameFlow.isItUsersTurn(game, 0)).toEqual(false)
  })

  test('Guesses with invalid words arent allowed', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    game.init()

    // Player 1 chooses a word
    let action = new Action(
      'chooseWord',
      {
        word: 'mango',
      },
      1
    )
    await game.handleAction(action)

    // Player 0 chooses a word
    let action2 = new Action(
      'chooseWord',
      {
        word: 'apple',
      },
      0
    )
    await game.handleAction(action2)

    // Player 0 guesses the word
    let action3 = new Action(
      'guess',
      {
        word: 'bgoew',
      },
      0
    )
    let actionResult = await game.handleAction(action3)
    expect(actionResult.success).toEqual(false)
  })
})
