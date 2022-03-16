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
      maxLength: 2,
      minLength: 2,
    },
    hitBoards: {
      type: 'array',
      maxLength: 2,
      minLength: 2,
    },
  },
}

const validateGameState = ajv.compile(stateSchema)

test.todo('Initial game state', async () => {
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

describe.todo('Action: place ships', async () => {
  test.todo(
    'Valid placement will result in ships being set, dont end player 0s turn',
    async () => {
      // Create a new game
      let game = new main.Game()
      // Activate testing mode
      game.test()
      // Add fake players
      game.mockPlayers(2)

      // Initialize the game
      game.init()
        
        let ships = Common.getAvailableShips(1);

      let action = new Action('placeShips', {
          ships: [
              new Common.Ship(1, )
          ]
      })
    }
  )

  test.todo('Ships cant be placed outside the board', async () => {})

  test.todo('Amounts of ships must match the availableShips', async () => {})
})

describe.todo('Action: shoot', async () => {
  test.todo('Missing will end turn', async () => {})

  test.todo('Hitting a ship will not end turn', async () => {})

  test.todo('Invalid shot will fail', async () => {})

  test.todo('Shooting down a ship will sink it', async () => {})

  test.todo('Shooting down all ships will result in win', async () => {})
})
