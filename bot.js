// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'sticker') {
        client.fetchPremiumStickerPacks().then(async packs => {
            console.log(packs);
            
            await interaction.reply(`Available stickers are: ${packs.map(pack => {

                return pack.name + ': ' + pack.id + ': ' + pack.stickers.map(sticker => {
                    return sticker.name + ': ' + sticker.id;
                }).join(', ');
            }).join(', ')}`.substr(0, 2000));
        }).catch(console.error);
	} else if (commandName === 'sendsticker') {
		await interaction.reply({
            content: 'a',
            stickers: [
                {
                    packId: '847199849233514549',
                    stickerId: '749052944682582036'
                }
            ]
        });
	}
});

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);

module.exports = client;