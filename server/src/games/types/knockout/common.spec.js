// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'

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
    await game.init();

    let actions = []

    
    actions.push(new Action('setDirections', //that mfer gonna die xd
        { directions: [{ x: -1000, y: 5 }, { x: 1, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0 }] }
        , 1));

    actions.push(new Action('setDirections',
        { directions: [{ x: 1, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0 }] }
        , 0));

    actions.forEach(async action => await GameFlow.endTurn(game));
    
    expect(game.data.dummies[0].fallen).toBe(true) // dummy should have fallen
    expect(game.data.ice.size).toBeLessThan(100) // percent should have decreased
    expect(GameFlow.isItUsersTurn(game, 0)).toBe(true) // it should still be player 0's turn
    
});
