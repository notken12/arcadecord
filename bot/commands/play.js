const { SlashCommandBuilder } = require('@discordjs/builders');
const games = require('../../games/game-types');
const { MessageActionRow, MessageEmbed, MessageSelectMenu, InteractionCollector } = require('discord.js');
const discordApiUtils = require('../../utils/discord-api');
const db = require('../../db/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a game!'),
    async execute(interaction) {
        var user = interaction.user;
        var d = await db.getUserFromDiscordId(user.id);
        if (d) {
            var message = this.getMessage();

            await interaction.reply(message);
        } else {
            await interaction.reply('Sign in to play: ' + process.env.BASE_URL + '/sign-in');
        }

    },
    getActionRow() {
        //create message action row
        const row = new MessageActionRow();
        var selectMenu = new MessageSelectMenu()
            .setCustomId('gameSelect')
            .setPlaceholder('Nothing selected');

        for (var g in games) {
            var game = games[g];
            selectMenu.addOptions([
                {
                    label: game.options.name,
                    description: game.options.description,
                    value: game.options.id
                }
            ]);
        }

        row.addComponents([selectMenu]);

        return row;
    },
    getMessage() {
        var row = this.getActionRow();
        var content = 'Select a game:';
        
        return { content, ephemeral: true, components: [row], embeds: [] };
    }
};