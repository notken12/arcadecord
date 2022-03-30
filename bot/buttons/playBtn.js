// playBtn.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import db from '../../db/db2.js'
import fetch from 'node-fetch'
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import { gameTypes } from '../../server/src/games/game-types.js'
import Emoji from '../../Emoji.js'

export default {
  data: {
    name: 'playGame',
  },
  async execute(interaction) {
    await interaction.deferUpdate()
    var dbOptionsId = interaction.message.id

    var user = await db.users.getByDiscordId(interaction.user.id)
    var dbOptions = await db.slashCommandOptions.getById(dbOptionsId)

    let guildId = interaction.guild.id
    let channelId = interaction.channel.id

    let gameType = gameTypes[dbOptions.typeId]

    const body = {
      options: {
        guild: interaction.guild.id,
        channel: interaction.channel.id,
        typeId: dbOptions.typeId,
        invitedUsers: dbOptions.invitedUsers,
        inThread: dbOptions.inThread,
      },
      userId: user._id,
    }

    const response = await fetch(`${process.env.GAME_SERVER_URL}/create-game`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GAME_SERVER_TOKEN}`,
      },
    }).catch((e) => {
      console.error(e)
      return { ok: false }
    })

    if (response.ok) {
      // log result
      var game = await response.json()
      interaction
        .editReply({
          components: [],
          content: `${Emoji.CHECK}  ${game.name} created`,
          embeds: [],
        })
        .catch(console.error)
      db.slashCommandOptions.delete(dbOptionsId)
    } else {
      console.log('failed to create game')
      console.log(response)
      console.log(response.statusText)
    }
  },
}
