// ping.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { SlashCommandBuilder } from '@discordjs/builders';
import db from '../../db/db2.js';
import gametypes from '../../src\games\game-types.js'

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Check your personal/server stats!'),
    async execute(config, interaction) {
        db.servers.delete(interaction.guildId)
        var server = await db.servers.getById(interaction.guildId);
        if (server == null) {
            console.log('hihi')
            server = await db.servers.create({ _id: interaction.guildId });
        }
        var user = db.users.get
        var msg = '```cpp\n' +
            `* ${interaction.guild.name} *\n` +
            `Games Played Per Type:\n`;
        console.log(server.gamesPlayed, server.stats.games)
        for (var [name, game] in server.games) {
            msg += '  ↳ ' + name + ': ' + game.gamesPlayed + '\n';
        }

        msg += '```'
        await interaction.reply(msg);
    },
};