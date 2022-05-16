// toggleThread.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import db from '../../db/db2.js';

import { getOptionsMessage } from './gameButton.js';

export default {
  data: {
    name: 'toggleThread',
    matcher: /^toggleThread:(true|false)$/,
  },
  async execute(_config, interaction) {
    await interaction.deferUpdate();
    let inThread = interaction.customId.split(':')[1] === 'true';
    let dbOptionsId = interaction.message.id;
    let dbOptions = await db.slashCommandOptions.update(dbOptionsId, {
      inThread: !inThread,
    });

    let msg = getOptionsMessage(dbOptions, interaction);
    interaction.editReply(msg).catch(console.error);
  },
};
