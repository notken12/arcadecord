// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'

//ඞ

// CHANGE test.todo() TO test() WHEN READY TO TEST

test.todo('set a direction for all dummies and complete a cycle', async () => {
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    await game.init();

    let actions = []

    actions.push(new Action('setDirection',
        { dummy: 0, direction: { x: 5, y: 5 } }
        , 1));

    actions.push(new Action('setDirection',
        { dummy: 1, direction: { x: 3, y: 2 } }
        , 1));
    actions.push(new Action('setDirection',
        { dummy: 2, direction: { x: 5, y: 5 } }
        , 1));

    actions.push(new Action('setDirection',
        { dummy: 3, direction: { x: 3, y: 2 } }
        , 1));

    actions.push("end turn")

    actions.push(new Action('setDirection',
        { dummy: 0, direction: { x: 5, y: 5 } }
        , 0));

    actions.push(new Action('setDirection',
        { dummy: 1, direction: { x: 3, y: 2 } }
        , 0));
    actions.push(new Action('setDirection',
        { dummy: 2, direction: { x: 5, y: 5 } }
        , 0));

    actions.push(new Action('setDirection',
        { dummy: 3, direction: { x: 3, y: 2 } }
        , 0));

    actions.push("end turn")

    actions.forEach(async action => {
        if (action != "end turn") await game.handleAction(action);
        else await GameFlow.endTurn(game)
    });
    expect(game.data.ice.size).toBeLessThan(100) // percent should have decreased
});
test.todo('set a direction for all dummies and complete a cycle', async () => {
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    await game.init();

    let actions = []

    actions.push(new Action('setDirection',
        { dummy: 0, direction: { x: -1000, y: 5 } } //no way this mfer ain't gonna fall
        , 1));

    actions.push(new Action('setDirection',
        { dummy: 1, direction: { x: 1, y: 0 } }
        , 1));
    actions.push(new Action('setDirection',
        { dummy: 2, direction: { x: 1, y: 0 } }
        , 1));

    actions.push(new Action('setDirection',
        { dummy: 3, direction: { x: 1, y: 0 } }
        , 1));

    actions.push("end turn")

    actions.push(new Action('setDirection',
        { dummy: 0, direction: { x: 1, y: 0 } }
        , 0));

    actions.push(new Action('setDirection',
        { dummy: 1, direction: { x: 1, y: 0 } }
        , 0));
    actions.push(new Action('setDirection',
        { dummy: 2, direction: { x: 1, y: 0 } }
        , 0));

    actions.push(new Action('setDirection',
        { dummy: 3, direction: { x: 1, y: 0 } }
        , 0));

    actions.push("end turn")

    actions.forEach(async action => {
        if (action != "end turn") await game.handleAction(action);
        else await GameFlow.endTurn(game)
    });
    expect(game.data.dummies[0].fallen).toBe(true) // percent should have decreased
});
