// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'

import Ajv from 'ajv'
const ajv = new Ajv()

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
}

const validateGameState = ajv.compile(stateSchema)

test('Initial 8ball game state', () => {
  // Create a new game
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  game.init()

  const valid = validateGameState(game.data)
  expect(game.data.balls.length).toEqual(16)
  expect(valid).toBe(true)

  expect(game.players[0].assignedPattern).toBe(undefined)
  expect(game.players[1].assignedPattern).toBe(undefined)
  expect(game.players[0].chosenPocket).toBe(undefined)
  expect(game.players[1].chosenPocket).toBe(undefined)
})

describe('Action: shoot', () => {
  test.todo('End turn if no ball is shot into pocket', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    await game.init()

    // Define the actions to be made
    let newPosition = {
      x: 1,
      y: 1,
      z: 1,
    }
    let newQuaternion = {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    }

    let missedShot = new Action('shoot', {
      angle: Math.PI / 2, // radians, for UI
      force: 10, // for UI
      newBallStates: [
        {
          name: '10ball',
          position: newPosition,
          quaternion: newQuaternion,
        },
        // in the real game, provide new ball positions for all balls
      ],
    })

    // Run the actions
    await game.handleAction(missedShot)

    // Check the game state
    const valid = validateGameState(game.data)
    expect(valid).toBe(true)

    expect(game.data.balls[10].out).toBe(false)
    expect(game.data.balls[10].position).toEqual(newPosition)
    expect(game.data.balls[10].quaternion).toEqual(newQuaternion)

    let stillTheirTurn = GameFlow.isItUsersTurn(game, 1)
    expect(stillTheirTurn).toBe(false)
  })

  test.todo('Do not end turn if ball is shot into pocket', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    await game.init()

    // Define the actions to be made
    let newPosition = {
      x: 1,
      y: 1,
      z: 1,
    }
    let newQuaternion = {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    }

    let missedShot = new Action('shoot', {
      angle: Math.PI / 2, // radians, for UI
      force: 10, // for UI
      newBallStates: [
        {
          name: '10ball',
          position: newPosition,
          quaternion: newQuaternion,
          out: true,
        },
        // in the real game, provide new ball positions for all balls
      ],
    })

    // Run the actions
    await game.handleAction(missedShot)

    // Check the game state
    const valid = validateGameState(game.data)
    expect(valid).toBe(true)

    expect(game.data.balls[10].out).toBe(true)
    expect(game.data.balls[10].position).toEqual(newPosition)
    expect(game.data.balls[10].quaternion).toEqual(newQuaternion)

    let stillTheirTurn = GameFlow.isItUsersTurn(game, 1)
    expect(stillTheirTurn).toBe(true)
  })

  test.todo("Set player's assigned color", async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    await game.init()

    // Define the actions to be made
    let newPosition = {
      x: 1,
      y: 1,
      z: 1,
    }
    let newQuaternion = {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    }

    let shot = new Action('shoot', {
      angle: Math.PI / 2, // radians, for UI
      force: 10, // for UI
      newBallStates: [
        {
          name: '10ball',
          position: newPosition,
          quaternion: newQuaternion,
          out: true,
        },
        // in the real game, provide new ball positions for all balls
      ],
    })

    // Run the actions
    await game.handleAction(shot)

    // Check the game state
    const valid = validateGameState(game.data)
    expect(valid).toBe(true)

    expect(game.data.balls[10].out).toBe(true)
    expect(game.data.balls[10].position).toEqual(newPosition)
    expect(game.data.balls[10].quaternion).toEqual(newQuaternion)

    let stillTheirTurn = GameFlow.isItUsersTurn(game, 1)
    expect(stillTheirTurn).toBe(true)

    // expect(game.players[1].assignedPattern).toBe
    // TODO: expect the assigned pattern to be the pattern of the ball that was pocketed
  })

  test.todo(
    'Lose game if player shoots 8 ball in pocket prematurely',
    async () => {
      // Create a new game
      let game = new main.Game()
      // Activate testing mode
      game.test()
      // Add fake players
      game.mockPlayers(2)

      // Initialize the game
      await game.init()
    }
  )

  test.todo(
    'Win game if 8 ball is shot once all other colors are made.',
    async () => {
      // Create a new game
      let game = new main.Game()
      // Activate testing mode
      game.test()
      // Add fake players
      game.mockPlayers(2)

      // Initialize the game
      await game.init()
    }
  )

  test.todo(
    'Lose game if player shoots 8 ball and cue ball in the pocket at the same time',
    async () => {
      // Create a new game
      let game = new main.Game()
      // Activate testing mode
      game.test()
      // Add fake players
      game.mockPlayers(2)

      // Initialize the game
      await game.init()
    }
  )
})
