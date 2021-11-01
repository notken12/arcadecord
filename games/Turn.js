class Turn {
    constructor (playerIndex, actions) {
        this.playerIndex = playerIndex;
        this.actions = actions || [];
    }

    getDataForClient () {
        return {
            playerIndex: this.playerIndex,
            actions: this.actions.map(action => action.getDataForClient())
        };
    }
}

module.exports = Turn;