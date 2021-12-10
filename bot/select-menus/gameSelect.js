const { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton, HTTPError } = require('discord.js');
const db = require('../../db/db2');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: "gameSelect",
    },
    async execute(interaction) {
        await interaction.deferUpdate();
        var typeId = interaction.values[0];

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

        /*var game = new gameType.Game();
        game.setGuild(interaction.guild);
        game.setChannel(interaction.channel);

        var user = await db.users.getByDiscordId(interaction.user.id);
        game.addPlayer(user._id);
        game.init();

        interaction.editReply({components: [], content: `${game.name} created`}).catch(console.error);*/

        var user = await db.users.getByDiscordId(interaction.user.id);

        const body = {
            options: {
                guild: interaction.guild.id,
                channel: interaction.channel.id,
                typeId: typeId
            },
            userId: user._id
        };

        const response = await fetch(`${process.env.GAME_SERVER_URL}/create-game`, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GAME_SERVER_TOKEN}`
            }
        });

        if (response.ok) {
            // log result
            var game = await response.json();
            interaction.editReply({ components: [], content: `${game.name} created` }).catch(console.error);
        }
    }
}