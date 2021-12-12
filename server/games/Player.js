var discordApiUtils = require('../utils/discord-api');

class Player {
    constructor(id, discordUser) {
        this.id = id;
        this.discordUser = discordUser;
    }
}

Player.getDataForClient = function (player, userId) {
    return {
        id: player.id,
        discordUser: player.discordUser
    };
};

module.exports = Player;