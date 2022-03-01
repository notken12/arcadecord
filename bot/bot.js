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

import Canvas from 'canvas';
import Game from '../server/src/games/Game.js';

// connect to the database
import db from '../db/db2.js';
db.connect();

// .env is used for all shards
config();

// get __dirname
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

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

	const channel = await client.channels.fetch(game.channel)

	var gameCreator = game.players[0]
	//var gameCreatorUser = new Discord.User();
	//Object.assign(gameCreatorUser, gameCreator.discordUser);

	var content = ''

	for (let discordId of game.invitedUsers) {
		content += `<@${discordId}> `
	}

	const message = await getInviteMessage(game)

	var embed = message.embeds[0]
	embed.setAuthor({
		name: `${gameCreator.discordUser.tag}`,
		iconURL: `https://cdn.discordapp.com/avatars/${gameCreator.discordUser.id}/${gameCreator.discordUser.avatar}.webp?size=32`
	});

	if (game.invitedUsers.length > 0) {
		embed.setDescription(
			`${game.description}\n\n<@${gameCreator.discordUser.id}> invited you to this game!`
		)
	} else {
		embed.setDescription(
			`${game.description}\n\nJoin <@${gameCreator.discordUser.id}> in this game!`
		)
	}


	if (content.length > 0) {
		message.content = content
	}

	return await channel.send(message);
}

client.sendTurnInvite = async function (g) {
	// get game type
	var gameType = gameTypes[g.typeId]

	// create instance of game
	const game = new gameType.Game(g);

	const channel = await client.channels.fetch(game.channel)

	var lastPlayer = game.players[game.turns[game.turns.length - 1].playerIndex]

	var m = {
		content: `${Emoji.ICON_ROUND} <@${lastPlayer.discordUser.id
			}>: *${game.emoji + ' ' || ''}${game.name}*`,
		allowedMentions: {
			parse: [],
		},
	}

	m.content = `${game.emoji || Emoji.ICON_ROUND}  **${game.name}**`

	await channel.send(m)

	let invite = await getInviteMessage(game)
	invite.content = `Your turn, <@${game.players[game.turn].discordUser.id}>`;
	
	var embed = message.embeds[0]
	embed.setAuthor({
		name: `${lastPlayer.discordUser.tag}`,
		iconURL: `https://cdn.discordapp.com/avatars/${lastPlayer.discordUser.id}/${lastPlayer.discordUser.avatar}.webp?size=32`
	});

	return await channel.send(invite);
}

async function getInviteMessage(game) {
	var embed = new MessageEmbed()
		.setTitle(game.name)
		.setDescription(`${game.description}`)
		.setColor(game.color || '#0099ff')
		.setURL(game.getURL())

	var button = new MessageButton()
		.setEmoji(Emoji.ICON_WHITE)
		.setLabel('Play')
		.setStyle('LINK')
		.setURL(game.getURL())

	var row = new MessageActionRow().addComponents([button])

	var invite = {
		embeds: [embed],
		components: [row],
	}

	var canvas = await game.getThumbnail()
	if (canvas) {
		let overlaySrc = path.resolve(__dirname, '../server/src/public/icons/thumbnail_overlay.svg');
		let overlayImg = await Canvas.loadImage(overlaySrc);
		const ctx = canvas.getContext('2d')
		ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);

		const image = canvas.toBuffer();

		const attachment = new MessageAttachment(image, 'thumbnail.png')

		embed.setImage(`attachment://thumbnail.png`)

		invite.files = [attachment]
	}

	return invite;
}


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