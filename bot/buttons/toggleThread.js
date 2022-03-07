import db from '../../db/db2.js';
import fetch from 'node-fetch';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { gameTypes } from '../../server/src/games/game-types.js';
import Emoji from '../../Emoji.js';

import { getOptionsMessage } from './gameButton.js';

export default {
    data: {
        name: 'toggleThread',
        matcher: /^toggleThread:(true|false)$/,
    },
    async execute(interaction) {
        await interaction.deferUpdate();
        let inThread = interaction.customId.split(':')[1] === 'true';
        let dbOptionsId = interaction.message.id;
        let dbOptions = await db.slashCommandOptions.update(dbOptionsId, { inThread: !inThread });

        let msg = getOptionsMessage(dbOptions);
        interaction.editReply(msg).catch(console.error);
    }
}