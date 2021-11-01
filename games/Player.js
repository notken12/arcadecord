var discordApiUtils = require('../utils/discord-api');

class Player {
    constructor(id, discordUser) {
        this.id = id;
        this.discordUser = discordUser;
    }

    getDataForClient() {
        return {
            discordUser: this.discordUser
        };
    }
}

module.exports = Player;