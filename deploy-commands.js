const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');

dotenv.config();


const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('PING THE BOT.'),
    //command for getting stickers
    new SlashCommandBuilder().setName('sticker').setDescription('get nitro stickers'),
    //command for sending a sticker
    new SlashCommandBuilder().setName('sendsticker').setDescription('send a sticker')
        .addStringOption(
            new SlashCommandStringOption()
                .setName('sticker')
                .setRequired(true)
                .setDescription('the sticker to send')
        ),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, "844651207481098260"), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);