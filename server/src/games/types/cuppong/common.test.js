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
  expect(stillTheirTurn).toBe(false)
  expect(game.data.sides[1].throwCount).toBe(0)
  expect(game.data.sides[0].throwsMade).toBe(0)
})

test('Making both shots will not end the turn', async () => {
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
    knockedCup: game.data.sides[0].cups[1].id,
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
  expect(stillTheirTurn).toBe(true)
  expect(game.data.sides[1].throwCount).toBe(0)
  expect(game.data.sides[0].throwsMade).toBe(0)
})

test('Knocking over all cups will result in a redemption', async () => {
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
  let actions = [];

  for (let i = 0; i < game.data.sides[0].cups.length; i++) {
    let action = new Action('throw', {
      force: { x: 0, y: 0, z: 0 },
      knockedCup: game.data.sides[0].cups[i].id,
    }, 1)
    actions.push(action)
  }

  // Run the actions
  for (let i = 0; i < actions.length; i++) {
    await game.handleAction(actions[i])
  }


  // Is it still the player's turn?
  let stillTheirTurn = game.isItUsersTurn(1)

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
  await game.init();

  // Define the actions to be made
  // new Action(type, data, userId)
  let actions = [];

  for (let i = 0; i < game.data.sides[0].cups.length; i++) {
    let action = new Action('throw', {
      force: { x: 0, y: 0, z: 0 },
      knockedCup: game.data.sides[0].cups[i].id,
    }, 1)
    actions.push(action)
  }

  // Run the actions
  for (let i = 0; i < actions.length; i++) {
    await game.handleAction(actions[i])
  }


  // Is it still the player's turn?
  let stillTheirTurn = game.isItUsersTurn(1)

  // Assertions
  expect(stillTheirTurn).toBe(false)

  let theirSide = game.data.sides[1]
  expect(theirSide.throwCount).toBe(0)
  expect(theirSide.throwsMade).toBe(0)

  let otherSide = game.data.sides[0]
  expect(otherSide.inRedemption).toBe(true)

  let throw1 = new Action('throw', {
    force: { x: 0, y: 0, z: 0 },
  }, 0)
  let throw2 = new Action('throw', {
    force: { x: 0, y: 0, z: 0 },
  }, 0)

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
  await game.init();

  // Define the actions to be made
  // new Action(type, data, userId)
  let actions = [];

  for (let i = 0; i < game.data.sides[0].cups.length; i++) {
    let action = new Action('throw', {
      force: { x: 0, y: 0, z: 0 },
      knockedCup: game.data.sides[0].cups[i].id,
    }, 1)
    actions.push(action)
  }

  // Run the actions
  for (let i = 0; i < actions.length; i++) {
    await game.handleAction(actions[i])
  }


  // Is it still the player's turn?
  let stillTheirTurn = game.isItUsersTurn(1)

  // Assertions
  expect(stillTheirTurn).toBe(false)

  let theirSide = game.data.sides[1]
  expect(theirSide.throwCount).toBe(0)
  expect(theirSide.throwsMade).toBe(0)

  let otherSide = game.data.sides[0]
  expect(otherSide.inRedemption).toBe(true)

  let throw1 = new Action('throw', {
    force: { x: 0, y: 0, z: 0 },
    knockedCup: game.data.sides[1].cups[0].id,
  }, 0)
  let throw2 = new Action('throw', {
    force: { x: 0, y: 0, z: 0 },
  }, 0)

  // Run the actions
  await game.handleAction(throw1)
  await game.handleAction(throw2)

  // Player hits one shot, their turn ends and they are no longer in redemption
  let stillTheirTurn = game.isItUsersTurn(0)
  let theirSide = game.data.sides[0]
  expect(stillTheirTurn).toBe(false)
  expect(theirSide.throwCount).toBe(0)
  expect(theirSide.throwsMade).toBe(0)
  expect(theirSide.inRedemption).toBe(false)

  // The last knocked cup will be put back
  let cupsLeft = theirSide.cups.filter(cup => !cup.out)
  expect(cupsLeft.length).toBe(1)
})