// stats.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { SlashCommandBuilder } from '@discordjs/builders';
import db from '../../db/db2.js';
import { gameTypes } from '../../server/src/games/game-types.js';
import { MessageButton } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Check your personal stats!'),
    async execute(_config, interaction) {
        var user = await db.users.getByDiscordId(interaction.user.id);
        var msg =
            '```cpp\n' +
            `Stats for ${interaction.user.username}\n\n`
        played = '',
            won = '';
        for (var g in gameTypes) {
            var game = gameTypes[g];
            if (!game.hidden) {
                var stats = user.stats.games.get(game.options.typeId),
                    gamesPlayed = 0,
                    gamesWon = 0;
                console.log(user.stats, game.options.typeId, stats)
                if (stats) {
                    gamesPlayed = stats.gamesPlayed;
                    gamesWon = stats.gamesWon;
                }
                played += '  ↳ ' + game.options.name + ': ' + gamesPlayed + '\n';
                won += '  ↳ ' + game.options.name + ': ' + gamesWon + '\n';
            }
        }
        msg += `Games played per type:  \n${played}\nGames played overall: ${user.stats.gamesPlayed}\n`;
        msg += `Games won per type:  \n${won}\nGames won overall: ${user.stats.gamesWon}`

        msg += '```';
        await interaction.reply(msg);
    },
};