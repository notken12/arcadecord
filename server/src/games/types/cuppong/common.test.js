import Chess from './main.js'
import Action from '../../Action.js'

test('not making both shots will end the turn', async () => {
  expect.assertions(1) // number of assertions that will be made

  let game = new Chess.Game()
  game.test() // disable discord events
  game.mockPlayers(2)

  await game.init()

  let throw1 = new Action('throw', 1, {
    force: { x: 0, y: 0, z: 0 },
  })
  let throw2 = new Action('throw', 1, {
    force: { x: 0, y: 0, z: 0 },
    knockedCup: game.data.sides[0].cups[0].id,
  })

  await game.handleAction(throw1)
  await game.handleAction(throw2)

  expect(game.isItUsersTurn(1)).toBe(false)
})
