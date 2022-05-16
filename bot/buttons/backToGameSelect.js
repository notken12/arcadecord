// backToGameSelect.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import db from '../../db/db2.js';
import { getMessage as getGameSelectMsg } from '../commands/play.js';

export default {
  data: {
    name: 'backToGameSelect',
  },
  async execute(_config, interaction) {
    await interaction.deferUpdate();

    let dbOptionsId = interaction.message.id;
    let dbOptions = await db.slashCommandOptions.getById(dbOptionsId);

    let invitedUsersIds = dbOptions.invitedUsers;

    let msg = getGameSelectMsg(dbOptionsId, invitedUsersIds);
    interaction.editReply(msg).catch(console.error);
  },
};
