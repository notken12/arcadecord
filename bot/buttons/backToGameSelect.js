const games = require('../../server/games/game-types');
const { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } = require('discord.js');

module.exports = {
    data: {
        name: "backToGameSelect",
    },
    async execute(interaction) {
        var message = require('../commands/play').getMessage();
        await interaction.update(message);
    }
}