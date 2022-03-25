import { expect, test, describe } from 'vitest'
// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'
import { LogOutput } from 'concurrently'

//ඞ

// CHANGE test.todo() TO test() WHEN READY TO TEST

// ok  ok ok ok ok ok ok okok okok o


test.todo('set a direction for all dummies, complete a cycle and test if a dummy as fallen', async () => {
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init()

  let actions = []

  actions.push(
    new Action(
      'setDummies',
      {
        directions: [
          {x: 30, y:50, fallen:false, moveDir: {x: 1, y: 0}, faceDir: 30},
          {x: 40, y:50, fallen:false, moveDir: {x: -5, y: 0}, faceDir: 80},
          {x: 50, y:50, fallen:false, moveDir: {x: -6, y: 0}, faceDir: 30},
          {x: 60, y:50, fallen:false, moveDir: {x: 7, y: 0}, faceDir: 120},
        ],
      },
      1
    )
  );

  actions.push(
    new Action(
      'setDummies',
      {
        directions: [
            {x: 30, y:50, fallen:false, moveDir: {x: 1, y: 0}, faceDir: 30},
            {x: 40, y:50, fallen:false, moveDir: {x: -5, y: 0}, faceDir: 80},
            {x: 50, y:50, fallen:false, moveDir: {x: -6, y: 0}, faceDir: 30},
            {x: 60, y:50, fallen:false, moveDir: {x: 7, y: 0}, faceDir: 120},
        ],
      },
      0
    )
  );

  actions.forEach(async (action) => await game.handleAction(action))

  expect(GameFlow.isItUsersTurn(game, 0)).toBe(true) // it should still be player 0's turn
  expect(game.data.ice.size).toBeLessThan(100) // percent should have decreased
})