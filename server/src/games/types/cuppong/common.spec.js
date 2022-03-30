// common.spec.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

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

// https://jestjs.io/docs/asynchronous

test('Not making both shots will end the turn', async () => {
  // Create a new game
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  // Define the actions to be made
  // new Action(type, data, userId)
  let throw1 = new Action(
    'throw',
    {
      force: { x: 0, y: 0, z: 0 },
    },
    1
  ) // <- fake players' userIds will be their index in game.players
  let throw2 = new Action(
    'throw',
    {
      force: { x: 0, y: 0, z: 0 },
      knockedCup: game.data.sides[0].cups[0].id,
    },
    1
  )

  // Run the actions
  await game.handleAction(throw1)
  await game.handleAction(throw2)

  // Is it still the player's turn?
  let stillTheirTurn = GameFlow.isItUsersTurn(game, 1)
  let theirSide = game.data.sides[1]

  // Assertions
  expect(stillTheirTurn).toBe(false)
  expect(theirSide.throwCount).toBe(0)
  expect(theirSide.throwsMade).toBe(0)
  expect(theirSide.ballsBack).toBe(false)
})

test('Making both shots will not end the turn and will give balls back', async () => {
  // Create a new game
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  // Define the actions to be made
  // new Action(type, data, userId)
  let throw1 = new Action(
    'throw',
    {
      force: { x: 0, y: 0, z: 0 },
      knockedCup: game.data.sides[0].cups[1].id,
    },
    1
  ) // <- fake players' userIds will be their index in game.players
  let throw2 = new Action(
    'throw',
    {
      force: { x: 0, y: 0, z: 0 },
      knockedCup: game.data.sides[0].cups[0].id,
    },
    1
  )

  // Run the actions
  await game.handleAction(throw1)
  await game.handleAction(throw2)

  // Is it still the player's turn?
  let stillTheirTurn = GameFlow.isItUsersTurn(game, 1)
  let theirSide = game.data.sides[1]

  // Assertions
  expect(stillTheirTurn).toBe(true)
  expect(theirSide.throwCount).toBe(0)
  expect(theirSide.throwsMade).toBe(0)
  expect(theirSide.ballsBack).toBe(true)
})

test('Knocking over all cups will result in a redemption', async () => {
  // Create a new game
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  // Define the actions to be made
  // new Action(type, data, userId)
  let actions = []

  for (let i = 0; i < game.data.sides[0].cups.length; i++) {
    let action = new Action(
      'throw',
      {
        force: { x: 0, y: 0, z: 0 },
        knockedCup: game.data.sides[0].cups[i].id,
      },
      1
    )
    actions.push(action)
  }

  // Run the actions
  for (let i = 0; i < actions.length; i++) {
    await game.handleAction(actions[i])
  }

  // Is it still the player's turn?
  let stillTheirTurn = GameFlow.isItUsersTurn(game, 1)

  // Assertions
  expect(stillTheirTurn).toBe(false)

  let theirSide = game.data.sides[1]
  expect(theirSide.throwCount).toBe(0)
  expect(theirSide.throwsMade).toBe(0)

  let otherSide = game.data.sides[0]
  expect(otherSide.inRedemption).toBe(true)
})

test('Not making any shots on redemption will lose', async () => {
  // Create a new game
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  // Define the actions to be made
  // new Action(type, data, userId)
  let actions = []

  for (let i = 0; i < game.data.sides[0].cups.length; i++) {
    let action = new Action(
      'throw',
      {
        force: { x: 0, y: 0, z: 0 },
        knockedCup: game.data.sides[0].cups[i].id,
      },
      1
    )
    actions.push(action)
  }

  // Run the actions
  for (let i = 0; i < actions.length; i++) {
    await game.handleAction(actions[i])
  }

  // Is it still the player's turn?
  let stillTheirTurn = GameFlow.isItUsersTurn(game, 1)

  // Assertions
  expect(stillTheirTurn).toBe(false)

  let theirSide = game.data.sides[1]
  expect(theirSide.throwCount).toBe(0)
  expect(theirSide.throwsMade).toBe(0)

  let otherSide = game.data.sides[0]
  expect(otherSide.inRedemption).toBe(true)

  let throw1 = new Action(
    'throw',
    {
      force: { x: 0, y: 0, z: 0 },
    },
    0
  )
  let throw2 = new Action(
    'throw',
    {
      force: { x: 0, y: 0, z: 0 },
    },
    0
  )

  // Run the actions
  await game.handleAction(throw1)
  await game.handleAction(throw2)

  // The game should end
  expect(game.hasEnded).toBe(true)
  // The other player should win
  expect(game.winner).toBe(1)
})

test('Making a shot on redemption will put the last cup back and end redemption', async () => {
  // Create a new game
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  // Define the actions to be made
  // new Action(type, data, userId)
  let actions = []

  for (let i = 0; i < game.data.sides[0].cups.length; i++) {
    let action = new Action(
      'throw',
      {
        force: { x: 0, y: 0, z: 0 },
        knockedCup: game.data.sides[0].cups[i].id,
      },
      1
    )
    actions.push(action)
  }

  // Run the actions
  for (let i = 0; i < actions.length; i++) {
    await game.handleAction(actions[i])
  }

  // Is it still the player's turn?
  let stillTheirTurn = GameFlow.isItUsersTurn(game, 1)

  // Assertions
  expect(stillTheirTurn).toBe(false)

  let theirSide = game.data.sides[1]
  expect(theirSide.throwCount).toBe(0)
  expect(theirSide.throwsMade).toBe(0)

  let otherSide = game.data.sides[0]
  expect(otherSide.inRedemption).toBe(true)

  let throw1 = new Action(
    'throw',
    {
      force: { x: 0, y: 0, z: 0 },
      knockedCup: game.data.sides[1].cups[0].id,
    },
    0
  )
  let throw2 = new Action(
    'throw',
    {
      force: { x: 0, y: 0, z: 0 },
    },
    0
  )

  // Run the actions
  await game.handleAction(throw1)
  await game.handleAction(throw2)

  // Player hits one shot, their turn ends and they are no longer in redemption
  stillTheirTurn = GameFlow.isItUsersTurn(game, 0)
  theirSide = game.data.sides[0]
  expect(stillTheirTurn).toBe(false)
  expect(theirSide.throwCount).toBe(0)
  expect(theirSide.throwsMade).toBe(0)
  expect(theirSide.inRedemption).toBe(false)

  // The last knocked cup will be put back
  let cupsLeft = theirSide.cups.filter((cup) => !cup.out)
  expect(cupsLeft.length).toBe(1)
})

test('Rearrange cups into triangle formation when possible', async () => {
  // Create a new game
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  // Knock down the front 4 cups so it will be rearranged
  for (let i = 0; i < 4; i++) {
    let action = new Action(
      'throw',
      {
        force: { x: 0, y: 0, z: 0 },
        knockedCup:
          game.data.sides[0].cups[game.data.sides[0].cups.length - i - 1].id,
      },
      1
    )
    await game.handleAction(action)
  }

  // Is it still the player's turn?
  let stillTheirTurn = GameFlow.isItUsersTurn(game, 1)
  expect(stillTheirTurn).toBe(true)

  // The cups should be rearranged
  let positions = Common.getTriangleArrangement(3, 4)
  let cups = game.data.sides[0].cups
  for (let i = 0; i < positions.length; i++) {
    expect(cups[i].rowNum).toEqual(positions[i].rowNum)
    expect(cups[i].rowPos).toEqual(positions[i].rowPos)
  }
})
