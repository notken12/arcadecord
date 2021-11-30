// Common action models

// An action model is a function...
// that takes in a Game and an Action (see Game.js and Action.js)
// and outputs the updated Game if it succeeds, and otherwise outputs false

function boop(game, action) {
    var i = action.playerIndex;
    var score = game.data.scores[i];
    score++;

    if (score >= 15) {
        game.end({
            winner: i
        });
    }

    return game;
}

function endTurn(game, action) {
    game.endTurn();

    return game;
}

function ask(game, action) {
    // Dummy model
    // Just make the action succeed
    // Server-side model will handle it after this
    return game;
}

// Compatibility with browser and node

const exports = {
    boop,
    endTurn,
    ask
}

if (typeof(module) !== 'undefined') {
    module.exports = exports; // require()
} else {
    window.Common = exports; // global var
}