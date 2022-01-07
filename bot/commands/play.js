import { SlashCommandBuilder, SlashCommandUserOption, SlashCommandStringOption } from '@discordjs/builders';
import {gameTypes as games} from '../../server/games/game-types.js';
import { MessageActionRow, MessageEmbed, MessageSelectMenu, InteractionCollector } from 'discord.js';
import db from '../../db/db2.js';
import Emoji from '../../Emoji.js';

function getActionRow(dbOptionsId, invitedUsersIds) {
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
                value: JSON.stringify({
                    typeId: game.options.typeId,
                    dbOptionsId: dbOptionsId,
                }),
                emoji: game.options.emoji || Emoji.ICON_ROUND
            }
        ]);
    }

    row.addComponents([selectMenu]);

    return row;
}

function getMessage(dbOptionsId, invitedUsersIds) {
    var row = getActionRow(dbOptionsId, invitedUsersIds);
    var content = '';

    if (invitedUsersIds.length > 0) {
        content += `Playing with: `;
        for (var i in invitedUsersIds) {
            var user = invitedUsersIds[i];
            content += `<@${user}> `;
        }
    }

    content += `\n\nSelect a game to play`;
    
    return { content, ephemeral: true, components: [row], embeds: [] };
}

export default {
    data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a game!')
    .addStringOption(new SlashCommandStringOption()
        .setDescription('@mention users to play with, or leave blank to play with anyone')
        .setName('with')
        .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
    
    
        var user = interaction.user;
        var d = await db.users.getByDiscordId(user.id);
        if (d) {
            var discordUsers = interaction.options.resolved.users; // discord.js Collection of discord.js users
            var ids = [];
    
            if (discordUsers) {
                discordUsers.each(u => {
                    ids.push(u.id);
                });
            }
    
            var dbOptions = await db.slashCommandOptions.create({ invitedUsers: ids });
            var message = getMessage(dbOptions._id, ids);
    
    
            await interaction.editReply(message);
        } else {
            await interaction.editReply({ content: 'Sign in to play: ' + process.env.GAME_SERVER_URL + '/sign-in', ephemeral: true });
        }
    
    }
}