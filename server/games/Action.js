class Action {
    constructor(type, userId, data, game) {
        this.type = type;
        this.userId = userId; // userId of the player who made the action

        this.playerIndex;   // set by Game, index of player in game.players.
                            // this is so that the user ids are not exposed to the client.
                            // otherwise the client could send an action as the other player
                            // this is used for showing actions of other players to the client

        this.data = data;

        this.playerIndex = game.getPlayerIndex(userId);
    }

    getDataForClient() {
        return {
            type: this.type,
            data: this.data,
            playerIndex: this.playerIndex
        }
    }
}

module.exports = Action;