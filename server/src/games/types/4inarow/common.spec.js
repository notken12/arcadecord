// common.spec.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { expect, test, describe } from 'vitest'
// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'

import Common from './common.js'

test('placing pieces works 4inarow', async () => {
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  let action = new Action(
    'place',
    {
      col: 0,
    },
    1
  )

  await game.handleAction(action)

  let stillTheirTurn = GameFlow.isItUsersTurn(game, 1)
  expect(game.data.board.pieces.length).toBe(1)
}) //CURRENTLY SUCCESSFUL! :))))))))

test('pieces stack 4inarow', async () => {
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  //actions
  var actions = []

  actions.push(
    new Action(
      'place',
      {
        col: 0,
      },
      1
    )
  )
  actions.push(
    new Action(
      'place',
      {
        col: 0,
      },
      0
    )
  )

  for (let i = 0; i < actions.length; i++) {
    await game.handleAction(actions[i])
  }

  expect(game.data.board.pieces[0].row).toBe(0)
  expect(game.data.board.pieces[1].row).toBe(1)
})

test('4 in a row vertically wins', async () => {
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  //actions
  var actions = []

  var i
  for (i = 0; i < 7; i++) {
    if (isEven(i)) {
      //First Player Turn
      var colToPlace = 0
    } else {
      var colToPlace = 1
    }
    actions.push(
      new Action(
        'place',
        {
          col: colToPlace,
        },
        [1, 0][colToPlace]
      )
    )
  }

  for (i = 0; i < actions.length; i++) {
    await game.handleAction(actions[i])
  }

  //assertions
  expect(game.hasEnded).toBe(true)
  expect(game.winner).toBe(1)
})

test('4 in a row horizontally wins', async () => {
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  //actions
  var actions = []

  var i
  var j
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 2; j++) {
      let action = new Action(
        'place',
        {
          col: i,
        },
        [1, 0][j]
      )
      actions.push(action)
    }
  }
  for (i = 0; i < actions.length; i++) {
    await game.handleAction(actions[i])
  }

  expect(game.hasEnded).toBe(true)
  expect(game.winner).toBe(1)
})

test('4 in a row diagonally wins', async () => {
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  //actions
  var actions = []

  let placements = [1, 3, 3, 4]
  var currentTurn = 1

  var i
  var j
  for (i = 0; i < 4; i++) {
    for (j = 0; j < placements[i]; j++) {
      let action = new Action(
        'place',
        {
          col: i,
        },
        currentTurn
      )

      actions.push(action)

      if (currentTurn == 0) {
        currentTurn = 1
      } else {
        currentTurn = 0
      }
    }
  }

  for (i = 0; i < actions.length; i++) {
    await game.handleAction(actions[i])
  }

  expect(game.hasEnded).toBe(true)
  expect(game.winner).toBe(1)
})

function isEven(number) {
  if (Math.floor(number / 2) == number / 2) {
    return true
  }
  return false
}
