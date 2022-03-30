// toggleThread.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import db from '../../db/db2.js'
import fetch from 'node-fetch'
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import { gameTypes } from '../../server/src/games/game-types.js'
import Emoji from '../../Emoji.js'

import { getOptionsMessage } from './gameButton.js'

export default {
  data: {
    name: 'toggleThread',
    matcher: /^toggleThread:(true|false)$/,
  },
  async execute(interaction) {
    await interaction.deferUpdate()
    let inThread = interaction.customId.split(':')[1] === 'true'
    let dbOptionsId = interaction.message.id
    let dbOptions = await db.slashCommandOptions.update(dbOptionsId, {
      inThread: !inThread,
    })

    let msg = getOptionsMessage(dbOptions, interaction)
    interaction.editReply(msg).catch(console.error)
  },
}
