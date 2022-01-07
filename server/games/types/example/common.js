// Common action models

// Import GameFlow to control game flow
var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");

var GameFlow;

// tests if global scope is bound to window
if(!isBrowser()) {
    GameFlow = await import('../../GameFlow.js');

} else {
    GameFlow = window.GameFlow;
}

// An action model is a function...
// that takes in a Game and an Action (see Game.js and Action.js)
// and outputs the updated Game if it succeeds, and otherwise outputs false

function boop(game, action) {
    var i = action.playerIndex;
    game.data.scores[i]++;

    // You win if you get to 15 points
    if (game.data.scores[i] >= 15) {
        GameFlow.end(game, {
            winner: i
        });
    }

    return game;
}

function endTurn(game, action) {
    GameFlow.endTurn(game);

    return game;
}

function ask(game, action) {
    // Check if the question has a question mark
    if (action.data.question.indexOf('?') === -1) {
        return false;
    }
    return game;
}

// Compatibility with browser and node

var exports = {
    boop,
    endTurn,
    ask
}

export default exports;