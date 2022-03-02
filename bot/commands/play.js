import { SlashCommandBuilder, SlashCommandUserOption, SlashCommandStringOption } from '@discordjs/builders';
import {gameTypes as games} from '../../server/src/games/game-types.js';
import { MessageActionRow, MessageEmbed, MessageSelectMenu, InteractionCollector, MessageButton } from 'discord.js';
import db from '../../db/db2.js';
import Emoji from '../../Emoji.js';

const THREAD_THRESHOLD = 100; // If the server's member count is above this threshold, automatically use a thread

function getActionRows(dbOptionsId, invitedUsersIds) {
    //create message action row
    // const row = new MessageActionRow();
    // var selectMenu = new MessageSelectMenu()
    //     .setCustomId('gameSelect')
    //     .setPlaceholder('Nothing selected');

    let rows = [new MessageActionRow()];
    for (var g in games) {
        var game = games[g];

        if (game.options.hidden) continue;
        // selectMenu.addOptions([
        //     {
        //         label: game.options.name,
        //         description: game.options.description,
        //         value: JSON.stringify({
        //             typeId: game.options.typeId,
        //             dbOptionsId: dbOptionsId,
        //         }),
        //         emoji: game.options.emoji || Emoji.ICON_ROUND
        //     }
        // ]);
        const button = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel(game.options.name)
            .setCustomId(`play:${game.options.typeId}`)
            .setEmoji(game.options.emoji || Emoji.ICON_ROUND);

        if (rows[rows.length - 1].components.length >= 3) {
            rows.push(new MessageActionRow());
        }
        let currentRow = rows[rows.length - 1];

        currentRow.addComponents([button]);
        
    }

    // row.addComponents([selectMenu]);

    return rows;
}

function getMessage(dbOptionsId, invitedUsersIds) {
    var rows = getActionRows(dbOptionsId, invitedUsersIds);
    var content = '';

    if (invitedUsersIds.length > 0) {
        content += `Playing with: `;
        for (var i in invitedUsersIds) {
            var user = invitedUsersIds[i];
            content += `<@${user}> `;
        }
    }

    content += `\n\nSelect a game to play`;
    
    return { content, ephemeral: true, components: rows, embeds: [] };
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
            
            let inThread = interaction.guild.memberCount >= THREAD_THRESHOLD;

            var message = getMessage(undefined, ids);
    
    
            var reply = await interaction.editReply(message);
            var dbOptions = await db.slashCommandOptions.create({ invitedUsers: ids, inThread, _id: reply.id });

        } else {
            let row = new MessageActionRow();
            let button = new MessageButton({
                label: 'Sign in',
                style: 'LINK',
                // emoji: '',
                url: process.env.GAME_SERVER_URL + '/sign-in'
            });
            row.addComponents([button]);
            await interaction.editReply({ content: '**🔑  Sign in to play**', ephemeral: true, components: [row] });
        }
    
    }
}