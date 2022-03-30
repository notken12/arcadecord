// common.spec.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { expect, test, describe } from 'vitest'
// Import the main module for this game type
import main from './main.js'
// Import the common module for this game type
import Common from './common.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'
// JSON verifier
import Ajv from 'ajv'
const ajv = new Ajv()

const stateSchema = {
  type: 'object',
  properties: {
    shipBoards: {
      type: 'array',
      maxItems: 2,
      minItems: 2,
    },
    hitBoards: {
      type: 'array',
      maxItems: 2,
      minItems: 2,
    },
    placed: {
      type: 'array',
      maxItems: 2,
      minItems: 2,
      items: {
        type: 'boolean',
      },
    },
  },
}

const validateGameState = ajv.compile(stateSchema)

test('Initial game state', async () => {
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

describe('Action: place ships', async () => {
  test('Valid placement will result in ships being set, dont end player 0s turn', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    game.init()

    let availableShips = Common.getAvailableShips(1)
    let shipPlacementBoard = Common.PlaceShips(
      availableShips,
      new Common.ShipPlacementBoard(10, 10)
    )
    let action = new Action(
      'placeShips',
      {
        shipPlacementBoard,
      },
      1
    )

    await game.handleAction(action)

    expect(GameFlow.isItUsersTurn(game, 1)).toEqual(false)
    expect(game.data.placed[1]).toEqual(true)

    let action2 = new Action(
      'placeShips',
      {
        shipPlacementBoard,
      },
      0
    )
    await game.handleAction(action2)

    expect(GameFlow.isItUsersTurn(game, 0)).toEqual(true)
    expect(game.data.placed[0]).toEqual(true)
  })

  test('Ships cant be placed outside the board', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    game.init()

    let availableShips = Common.getAvailableShips(1)
    let shipPlacementBoard = Common.PlaceShips(
      availableShips,
      new Common.ShipPlacementBoard(10, 10)
    )
    let { ships } = shipPlacementBoard
    ships[0].row = 10 // set it to outside the board

    let action = new Action(
      'placeShips',
      {
        shipPlacementBoard,
      },
      1
    )

    expect((await game.handleAction(action)).success).toEqual(false)
  })

  test('Ships cannot overlap', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    game.init()

    let availableShips = Common.getAvailableShips(1)
    let shipPlacementBoard = Common.PlaceShips(
      availableShips,
      new Common.ShipPlacementBoard(10, 10)
    )
    let { ships } = shipPlacementBoard
    ships[0].row = 5
    ships[0].col = 5
    ships[1].row = 5
    ships[1].col = 5

    let action = new Action(
      'placeShips',
      {
        shipPlacementBoard,
      },
      1
    )

    expect(await game.handleAction(action)).toEqual({ success: false })
  })

  test('Amounts of ships must match the availableShips', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    game.init()

    let availableShips = Common.getAvailableShips(1)
    let shipPlacementBoard = Common.PlaceShips(
      availableShips,
      new Common.ShipPlacementBoard(10, 10)
    )
    let { ships } = shipPlacementBoard

    let oneShip = ships.find((s) => s.len === 1)
    oneShip.len = 2

    let action = new Action(
      'placeShips',
      {
        shipPlacementBoard,
      },
      1
    )

    expect((await game.handleAction(action)).success).toEqual(false)
  })
})

describe('Action: shoot', async () => {
  let availableShips = Common.getAvailableShips(1)
  let shipPlacementBoard = Common.PlaceShips(
    availableShips,
    new Common.ShipPlacementBoard(10, 10)
  )
  let { ships } = shipPlacementBoard

  ships = ships.sort((a, b) => a.len - b.len) // SORT ASCENDING
  for (let i = 0; i < ships.length; i++) {
    let ship = ships[i]
    ship.row = i
    ship.col = 0
    ship.dir = 1 // horizontal, to the right
  }

  async function makePlacedGame() {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    game.init()

    let action = new Action('placeShips', { shipPlacementBoard }, 1)
    let action2 = new Action('placeShips', { shipPlacementBoard }, 0)

    await game.handleAction(action)
    await game.handleAction(action2)
    return game
  }

  test('Missing will end turn', async () => {
    let game = await makePlacedGame()

    let shoot = new Action('shoot', { row: 0, col: 9 }, 0)

    await game.handleAction(shoot)

    expect(GameFlow.isItUsersTurn(game, 0)).toEqual(false)
  })

  test('Hitting a ship will not end turn', async () => {
    let game = await makePlacedGame()

    let shoot = new Action('shoot', { row: 0, col: 0 }, 0)

    await game.handleAction(shoot)

    expect(GameFlow.isItUsersTurn(game, 0)).toEqual(true)
  })

  test('Invalid shot will fail', async () => {
    let game = await makePlacedGame()

    let shoot = new Action('shoot', { row: 10, col: 0 }, 0)

    expect((await game.handleAction(shoot)).success).toEqual(false)
  })

  test('Shooting down a ship will sink it', async () => {
    let game = await makePlacedGame()

    let shoot = new Action('shoot', { row: 0, col: 0 }, 0)

    await game.handleAction(shoot)

    expect(game.data.shipBoards[1].ships[0].sunk).toEqual(true)
    expect(GameFlow.isItUsersTurn(game, 0)).toEqual(true)
  })

  test('Shooting down all ships will result in win', async () => {
    let game = await makePlacedGame()

    for (let ship of ships) {
      for (let i = 0; i < ship.len; i++) {
        let shoot = new Action('shoot', { row: ship.row, col: ship.col + i }, 0)
        await game.handleAction(shoot)
        if (!game.hasEnded)
          expect(GameFlow.isItUsersTurn(game, 0)).toEqual(true)
      }
    }

    expect(game.hasEnded).toEqual(true)
    expect(game.winner).toEqual(0)
  })
})
