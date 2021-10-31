var discordApiUtils = require('../utils/discord-api');

class Player {
    constructor (id, discordUser) {
        this.id = id;

        this.discordUser = discordUser;
    }
}

module.exports = Player;