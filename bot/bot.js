// Require the necessary discord.js classes
const dotenv = require('dotenv');
const Builders = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } = require('discord.js');


const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');

// connect to the database
const db = require('../db/db2');
db.connect();

// .env is used for all shards
dotenv.config({
	path: './bot/.env'
});

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

client.login(process.env.BOT_TOKEN);

module.exports = {
	getUserProfile: function (id) {
		return client.users.fetch(id, {force: true}).catch((e) => {
			console.log("Bot couldn't fetch user profile with id" + id);
			console.log(e);
			return null;
		});
	},
	login: function () {
		client.login(process.env.BOT_TOKEN);
	}
};