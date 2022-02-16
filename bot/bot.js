// Require the necessary discord.js classes
import { config } from 'dotenv';
import {
	MessageAttachment,
	MessageActionRow,
	MessageEmbed,
	MessageSelectMenu,
	MessageButton,
} from 'discord.js'

import { gameTypes } from '../server/src/games/game-types.js';
import Emoji from '../Emoji.js'

import { readdirSync } from 'fs';
import { Client, Collection, Intents } from 'discord.js';

// connect to the database
import db from '../db/db2.js';
db.connect();

// .env is used for all shards
config();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();
client.selectMenus = new Collection();
client.buttons = new Collection();
client.gameTypes = gameTypes;
client.Emoji = Emoji;

client.sendStartMessage = async function (g) {
	// get game type
	var gameType = gameTypes[g.typeId]

	// create instance of game
	const game = new gameType.Game(g);

	var gameCreator = game.players[0]
	//var gameCreatorUser = new Discord.User();
	//Object.assign(gameCreatorUser, gameCreator.discordUser);

	var content = ''

	for (let discordId of game.invitedUsers) {
		content += `<@${discordId}> `
	}

	var embed = new MessageEmbed()
		.setTitle(game.name)
		.setColor(game.color || '#0099ff')
		.setURL(game.getURL())
	/*.setAuthor({
			name: `<@${gameCreator.discordUser.id}>`,
			iconURL: `https://cdn.discordapp.com/avatars/${gameCreator.discordUser.id}/${gameCreator.discordUser.avatar}.webp?size=80`
		})*/
	/*.setFooter(
			`<@${gameCreator.discordUser.id}>`,
			`https://cdn.discordapp.com/avatars/${gameCreator.discordUser.id}/${gameCreator.discordUser.avatar}.webp?size=80`
		);*/

	if (game.invitedUsers.length > 0) {
		embed.setDescription(
			`${game.description}\n\n<@${gameCreator.discordUser.id}> invited you to this game!`
		)
	} else {
		embed.setDescription(
			`${game.description}\n\nJoin <@${gameCreator.discordUser.id}> in this game!`
		)
	}

	var startGameButton = new MessageButton()
		.setEmoji(Emoji.ICON_WHITE)
		.setLabel('Play')
		.setStyle('LINK')
		.setURL(game.getURL())

	var row = new MessageActionRow().addComponents([startGameButton])
	const message = { embeds: [embed], components: [row] }

	if (content.length > 0) {
		message.content = content
	}

	if (typeof game.getThumbnail == 'function') {
		var image = await game.getThumbnail()
		if (image) {
			const attachment = new MessageAttachment(image, 'thumbnail.png')

			embed.setImage(`attachment://thumbnail.png`)

			message.files = [attachment]
		}
	}

	console.log(message)
	return await client.channels.cache.get(game.channel).send(message);
}

// get __dirname
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);


const eventFiles = readdirSync(__dirname + '/events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	let { default: event } = await import(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const commandFiles = readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));
const selectMenuFiles = readdirSync(__dirname + '/select-menus').filter(file => file.endsWith('.js'));
//get button files
const buttonFiles = readdirSync(__dirname + '/buttons').filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
	let { default: command } = await import(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}


for (const file of selectMenuFiles) {
	let { default: menu } = await import(`./select-menus/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.selectMenus.set(menu.data.name, menu);
}

//set buttons
for (const file of buttonFiles) {
	let { default: button } = await import(`./buttons/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.buttons.set(button.data.name, button);
}

client.login(process.env.BOT_TOKEN);