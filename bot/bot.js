// Require the necessary discord.js classes
import { config } from 'dotenv';
import { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } from 'discord.js';


import { readdirSync } from 'fs';
import { Client, Collection, Intents } from 'discord.js';

// connect to the database
import db from '../db/db2.js';
db.connect();

// .env is used for all shards
config({
	path: './bot/.env'
});

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();
client.selectMenus = new Collection();
client.buttons = new Collection();

// get __dirname
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);


const eventFiles = readdirSync(__dirname + '/events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    let {default: event} = await import(`./events/${file}`);
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
    let {default: command} = await import(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}


for (const file of selectMenuFiles) {
    let {default: menu} = await import(`./select-menus/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.selectMenus.set(menu.data.name, menu);
}

//set buttons
for (const file of buttonFiles) {
    let {default: button} = await import(`./buttons/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.buttons.set(button.data.name, button);
}

client.login(process.env.BOT_TOKEN);