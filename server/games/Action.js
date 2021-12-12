class Action {
    constructor(type, userId, data, game) {
        this.type = type;
        this.userId = userId; // userId of the player who made the action

        this.playerIndex;   // set by Game, index of player in game.players.

        this.data = data;

        this.playerIndex = game.getPlayerIndex(userId);
    }

    getDataForClient() {

    }
}

Action.getDataForClient = function (action, userId) {
    return {
        type: action.type,
        data: action.data,
        playerIndex: action.playerIndex,
        userId: action.userId
    }
}

module.exports = Action;