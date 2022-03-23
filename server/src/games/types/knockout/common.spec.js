// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'
import { LogOutput } from 'concurrently';

//ඞ

// CHANGE test.todo() TO test() WHEN READY TO TEST

// ok  ok ok ok ok ok ok okok okok o

test('set a direction for all dummies, complete a cycle and test if a dummy as fallen', async () => {
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    await game.init();

    let actions = []

    
    actions.push(new Action('setDirections', //null means they fell
        { directions: [null, { x: 1, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0 }] }
        , 1));

    actions.push(new Action('setDirections',
        { directions: [{ x: 1, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0 }] }
        , 0));

    actions.forEach(async action => await game.handleAction(action));
    
    expect(game.data.dummies[0].fallen).toBe(true) // dummy should have fallen
    expect(game.data.dummies[1].moveDir.x).toBe(1)
    expect(GameFlow.isItUsersTurn(game, 1)).toBe(true) // it should still be player 1's turn

    
    //expect(game.data.ice.size).toBeLessThan(100) // percent should have decreased
    
});
