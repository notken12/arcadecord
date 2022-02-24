// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'

test('4 in a row vertically wins', async function() => {
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init();

  //actions

  let action = new Action('place', {
    col:0
  })

  expect(game.hasEnded).toBe(true)
  expect(game.winner).toBe(1)
})
