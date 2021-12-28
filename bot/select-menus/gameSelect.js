const { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton, HTTPError } = require('discord.js');
const db = require('../../db/db2');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: "gameSelect",
    },
    async execute(interaction) {
        await interaction.deferUpdate();

        var data = JSON.parse(interaction.values[0])

        var typeId = data.typeId;
        var dbOptionsId = data.dbOptionsId;

        var user = await db.users.getByDiscordId(interaction.user.id);
        var dbOptions = await db.slashCommandOptions.getById(dbOptionsId);

        const body = {
            options: {
                guild: interaction.guild.id,
                channel: interaction.channel.id,
                typeId: typeId,
                invitedUsers: dbOptions.invitedUsers,
            },
            userId: user._id
        };

        const response = await fetch(`${process.env.GAME_SERVER_URL}/create-game`, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GAME_SERVER_TOKEN}`
            }
        });

        if (response.ok) {
            // log result
            var game = await response.json();
            interaction.editReply({ components: [], content: `${game.name} created` }).catch(console.error);
            db.slashCommandOptions.delete(dbOptionsId);
        }
    }
}