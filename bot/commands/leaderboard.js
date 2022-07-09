// leaderboard.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { SlashCommandBuilder } from '@discordjs/builders';
import {
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
  InteractionCollector,
  MessageButton,
} from 'discord.js';
import db from '../../db/db2.js';
import { gameTypes } from '../../server/src/games/game-types.js';
import Emoji from '../../Emoji.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription("Check this server's leaderboard and stats!"),
  async execute(config, interaction) {
    if (!interaction.guildId) {
      await interaction.reply(
        "❓ This is the command for checking a server's leaderboard. Please try using it in a server!"
      );
      return;
    }
    const url = `${config.webServerUrl}/leaderboards/${interaction.guildId}`;
    const button = new MessageButton()
      .setStyle('LINK')
      .setURL(url)
      .setLabel('View leaderboard');
    const row = new MessageActionRow();
    row.addComponents([button]);
    interaction.reply({
      content: `🏆 Check out the server leaderboard here!`,
      components: [row],
    });
    // var server = await db.servers.getById(interaction.guildId);
    // if (server == null) {
    //   server = await db.servers.create({
    //     _id: interaction.guildId,
    //     name: interaction.guild.name,
    //     iconURL: interaction.guild.iconURL(),
    //   });
    // }
    // var msg =
    //   '```cpp\n' +
    //   `Stats for ${interaction.guild.name}\n\n` +
    //   `Games played per type:  \n`;
    // for (var g in gameTypes) {
    //   var game = gameTypes[g];
    //   var stats = server.stats.games.get(game.options.typeId),
    //     gamesPlayed = 0;
    //   if (stats) gamesPlayed = stats.gamesPlayed;
    //   if (!game.hidden)
    //     msg += '  ↳ ' + game.options.name + ': ' + gamesPlayed + '\n';
    // }
    // msg += `\nGames played overall: ${server.gamesPlayed}`;
    //
    // msg += '```';
    // await interaction.reply(msg);
  },
};
