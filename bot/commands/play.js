const { SlashCommandBuilder } = require('@discordjs/builders');
const games = require('../../server/games/game-types');
const { MessageActionRow, MessageEmbed, MessageSelectMenu, InteractionCollector } = require('discord.js');
const db = require('../../db/db2');
const Emoji = require('../../Emoji');

function getActionRow() {
    //create message action row
    const row = new MessageActionRow();
    var selectMenu = new MessageSelectMenu()
        .setCustomId('gameSelect')
        .setPlaceholder('Nothing selected');

    for (var g in games) {
        var game = games[g];

        if (game.options.hidden) continue;
        selectMenu.addOptions([
            {
                label: game.options.name,
                description: game.options.description,
                value: game.options.typeId,
                emoji: game.options.emoji || Emoji.ICON_ROUND
            }
        ]);
    }

    row.addComponents([selectMenu]);

    return row;
}

function getMessage() {
    var row = getActionRow();
    var content = 'Select a game:';
    
    return { content, ephemeral: true, components: [row], embeds: [] };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a game!'),
    async execute(interaction) {
        await interaction.deferReply({ephemeral:true});
        var user = interaction.user;
        var d = await db.users.getByDiscordId(user.id);
        if (d) {
            var message = getMessage();

            await interaction.editReply(message);
        } else {
            await interaction.editReply({content:'Sign in to play: ' + process.env.GAME_SERVER_URL + '/sign-in', ephemeral: true});
        }

    }
};
