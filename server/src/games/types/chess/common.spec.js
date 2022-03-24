import { expect, test, describe } from 'vitest'
// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'

// https://jestjs.io/docs/asynchronous

test('50 moves without pawn moves or captures will result in a draw', async () => {
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

  // Run the actions
  for (let i = 0; i < 50; i++) {
    for (let p = 1; p >= 0; p--) {
      let oddMove = (i + 1) % 2 === 1
      let fromFile = 1
      let fromRank = p === 1 ? 0 : 7
      let toFile = 0
      let toRank = p === 1 ? 2 : 5

      let action = new Action(
        'movePiece',
        {
          move: {
            from: oddMove ? [fromFile, fromRank] : [toFile, toRank],
            to: oddMove ? [toFile, toRank] : [fromFile, fromRank],
            pieceType: 'n',
          },
        },
        p
      )

      await game.handleAction(action)
    }
  }

  // Assertions
  expect(game.hasEnded).toBe(true)
  expect(game.winner).toBe(-1)
})

test('Insufficient material will result in a draw', async () => {
  // Create a new game
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  // Delete all pieces but kings
  game.data.board = game.data.board.filter((p) => p.type === 'k')

  // Define the actions to be made
  // new Action(type, data, userId)
  let move = new Action(
    'movePiece',
    {
      move: {
        pieceType: 'k',
        from: [4, 0],
        to: [4, 1],
      },
    },
    1
  )

  // Run the actions
  await game.handleAction(move)

  // Assertions
  expect(game.hasEnded).toBe(true)
  expect(game.winner).toBe(-1)
})
