import db from '../../db/db2.js'
import fetch from 'node-fetch'
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import { gameTypes } from '../../server/src/games/game-types.js'
import Emoji from '../../Emoji.js'
import { getMessage as getGameSelectMsg } from '../commands/play.js'

export default {
  data: {
    name: 'backToGameSelect',
  },
  async execute(interaction) {
    await interaction.deferUpdate()

    let dbOptionsId = interaction.message.id
    let dbOptions = await db.slashCommandOptions.getById(dbOptionsId)

    let invitedUsersIds = dbOptions.invitedUsers

    let msg = getGameSelectMsg(dbOptionsId, invitedUsersIds)
    interaction.editReply(msg).catch(console.error)
  },
}
