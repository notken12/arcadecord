const Action = require('./Action');

class Turn {
    constructor (playerIndex, actions) {
        this.playerIndex = playerIndex;
        this.actions = actions || [];
    }

    getDataForClient () {

    }
}

Turn.getDataForClient = function (turn, userId) {
    return {
        playerIndex: turn.playerIndex,
        actions: turn.actions.map(action => Action.getDataForClient(action, userId))
    };
};

module.exports = Turn;