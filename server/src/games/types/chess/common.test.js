// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'

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
    for (let p = 0; p < 2; p++) {
      let oddMove = (i + 1) % 2 === 1
      let fromFile = 1
      let fromRank = p === 1 ? 0 : 7
      let toFile = 0
      let toRank = p === 1 ? 2 : 5

      await game.handleAction(
        new Action(
          'movePiece',
          {
            move: {
              from: oddMove ? [fromFile, fromRank] : [toFile, toRank],
              to: oddMove ? [toFile, toRank] : [fromFile, fromRank],
            },
          },
          p
        )
      )
    }
  }

  // Is it still the player's turn?
  let isDraw = game.hasEnded && game.winner === -1

  // Assertions
  expect(isDraw).toEqual(true)
})
