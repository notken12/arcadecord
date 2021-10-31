const games = require('../../games/game-types');
const { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } = require('discord.js');
const gamesManager = require('../../games/gamesManager');

module.exports = {
    data: {
        name: "gameSelect",
    },
    async execute(interaction) {
        var gameType = games[interaction.values[0]];
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
            //TODO: make user sign in before creating a game so that they can be added
            game.init();


            // interaction.deleteReply();
            interaction.channel.send(game.getStartMessage());
        }
    }
}