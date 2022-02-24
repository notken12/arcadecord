// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'


test('placing pieces works 4inarow', async () => {
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init();

  let action = new Action('place', {
    col:0
  }, 1)

  await game.handleAction(action)

  expect(game.data.board.cells[5][0]).toBe(true)
})

test('4 in a row vertically wins', async () => {
  let game = new main.Game()
  // Activate testing mode
  game.test()
  // Add fake players
  game.mockPlayers(2)

  // Initialize the game
  await game.init();

  //actions
  var actions = []

  var i;
  for(i=0;i<8;i++){
    if(isEven(i)){//First Player Turn
      var colToPlace = 0;
    } else {
      var colToPlace = 1;
    }
    actions.push(new Action('place', {
      col:0
    }, 1))
  }

  for(i=0;i<actions.length;i++){
    await game.handleAction(actions[i])
  }

  //assertions
  expect(game.data).toBe("empty")
  expect(game.hasEnded).toBe(true)
  expect(game.winner).toBe(1)
})

function isEven(number){
  if(Math.floor(number/2) == number/2){
    return true
  }
  return false;
}
