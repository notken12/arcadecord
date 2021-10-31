// Require the necessary discord.js classes
const dotenv = require('dotenv');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote } = require('@discordjs/builders');

const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');

dotenv.config();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();
client.selectMenus = new Collection();
client.buttons = new Collection();


const eventFiles = fs.readdirSync(__dirname + '/events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const commandFiles = fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));
const selectMenuFiles = fs.readdirSync(__dirname + '/select-menus').filter(file => file.endsWith('.js'));
//get button files
const buttonFiles = fs.readdirSync(__dirname + '/buttons').filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}


for (const file of selectMenuFiles) {
	const menu = require(`./select-menus/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.selectMenus.set(menu.data.name, menu);
}

//set buttons
for (const file of buttonFiles) {
	const button = require(`./buttons/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.buttons.set(button.data.name, button);
}

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);

module.exports = client;