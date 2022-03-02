import db from '../../db/db2.js';
import fetch from 'node-fetch';

export default {
    data: {
        name: 'play a certain game',
        matcher: /^play:/,
    },
    async execute(interaction) {
        await interaction.deferUpdate();

        var data = interaction.customId;

        var typeId = data.split(':')[1];
        var dbOptionsId = interaction.message.id;

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
        }).catch(e => {
            console.error(e);
            return { ok: false };
        });

        if (response.ok) {
            // log result
            var game = await response.json();
            interaction.editReply({ components: [], content: `${game.name} created` }).catch(console.error);
            db.slashCommandOptions.delete(dbOptionsId);
        } else {
            console.log('failed to create game');
            console.log(response);
            console.log(response.statusText);
        }
    }
}