// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'

// https://jestjs.io/docs/asynchronous

test('Not making both shots will end the turn', async () => {
  // Create a new game
  let game = new main.Game() 
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init();

  // Define the actions to be made
  // new Action(type, data, userId)
  let throw1 = new Action('throw', {
    force: { x: 0, y: 0, z: 0 },
  }, 1) // <- fake players' userIds will be their index in game.players
  let throw2 = new Action('throw', {
    force: { x: 0, y: 0, z: 0 },
    knockedCup: game.data.sides[0].cups[0].id,
  }, 1)

  // Run the actions
  await game.handleAction(throw1)
  await game.handleAction(throw2)

  // Is it still the player's turn?
  let stillTheirTurn = game.isItUsersTurn(1)

  // Assertions
  expect(stillTheirTurn).toEqual(false)
})
