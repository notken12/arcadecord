const gameTypes = require('../../games/game-types');
const { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } = require('discord.js');
const gamesManager = require('../../games/gamesManager');
const db = require('../../db/db');

module.exports = {
    data: {
        name: "gameSelect",
    },
    async execute(interaction) {
        await interaction.deferUpdate();
        var gameType = gameTypes[interaction.values[0]];
        if (gameType) {
            // var embed = new MessageEmbed()
            //     .setTitle(game.name)
            //     .setDescription(game.description)
            //     .setColor(game.color || '#0099ff');
            // var startGameButton = new MessageButton()
            //     .setCustomId('startGame')
            //     .setLabel('Start Game')
            //     .setStyle('PRIMARY');
            // var backButton = new MessageButton()
            //     .setCustomId('backToGameSelect')
            //     .setLabel('Back')
            //     .setStyle('SECONDARY');

            // var row = new MessageActionRow().addComponents([startGameButton, backButton]);
            // await interaction.update({ embeds: [embed], components: [row] });

            var game = new gameType.Game();
            game.setGuild(interaction.guild);
            game.setChannel(interaction.channel);

            var user = await db.getUserFromDiscordId(interaction.user.id);
            game.addPlayer(user.get('id'));
            game.init();

            interaction.editReply({components: [], content: `${game.name} created`}).catch(console.error);
        }
    }
}