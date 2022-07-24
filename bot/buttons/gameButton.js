// gameButton.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import db from '../../db/db2';
import fetch from 'node-fetch';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { gameTypes } from '../../server/src/games/game-types';
import Emoji from '../../Emoji.js';

function getOptionsMessage(dbOptions, interaction) {
  let gameType = gameTypes[dbOptions.typeId];

  let emoji = gameType.options.emoji || Emoji.ICON_ROUND;
  let embed = new MessageEmbed()
    .setTitle(`${emoji}  ${gameType.options.name}`)
    .setDescription(`${gameType.options.description}`)
    .setColor(gameType.options.color || '#0099ff');

  let playerCount;
  if (gameType.options.maxPlayers === Infinity) {
    playerCount = gameType.options.minPlayers + '+';
  } else if (gameType.options.minPlayers === gameType.options.maxPlayers) {
    playerCount = gameType.options.minPlayers;
  } else {
    playerCount = `${gameType.options.minPlayers}-${gameType.options.maxPlayers}`;
  }

  embed.addField(`🧑‍🤝‍🧑  Players: ${playerCount}`, '** **', false);

  // embed.addField('⚙️  Options', '** **', false);

  let row = new MessageActionRow();

  let backButton = new MessageButton()
    .setStyle('SECONDARY')
    .setLabel('Back')
    .setCustomId('backToGameSelect')
    .setEmoji(Emoji.BACK);
  row.addComponents([backButton]);

  if (interaction.channel.type === 'GUILD_TEXT') {
    let threadToggleBtn = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('Play in thread')
      .setCustomId('toggleThread:' + dbOptions.inThread);

    if (dbOptions.inThread) {
      threadToggleBtn.setEmoji(Emoji.CHECK);
    } else {
      threadToggleBtn.setEmoji(Emoji.X);
    }
    row.addComponents([threadToggleBtn]);
  }

  let playBtn = new MessageButton()
    .setStyle('SUCCESS')
    .setLabel('Play!')
    .setEmoji(Emoji.ICON_WHITE)
    .setCustomId('playGame');
  row.addComponents([playBtn]);

  const msg = {
    content: null,
    embeds: [embed],
    components: [row],
  };

  return msg;
}

export { getOptionsMessage };

export default {
  data: {
    name: 'play a certain game',
    matcher: /^play:/,
  },
  async execute(_config, interaction) {
    await interaction.deferUpdate();

    var data = interaction.customId;

    var typeId = data.split(':')[1];
    var dbOptionsId = interaction.message.id;

    var dbOptions = await db.slashCommandOptions.update(dbOptionsId, {
      typeId,
    });

    var msg = getOptionsMessage(dbOptions, interaction);
    interaction.editReply(msg).catch(console.error);
  },
};
