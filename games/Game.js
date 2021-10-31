const { SnowflakeUtil } = require('discord.js');
const dotenv = require('dotenv');
const gamesManager = require('./gamesManager');
const { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } = require('discord.js');
const Player = require('./Player');
const discordApiUtils = require('../utils/discord-api');

dotenv.config();

class Game {
    // options schema
    // {
    //     "id": "",
    //     "name": "",
    //     "description": "",
    //     "image": "",
    //     "aliases": [],
    //     "players": [],
    //     "maxPlayers": 0,
    //     "minPlayers": 0,
    // }
    constructor(options) {
        for (let key in options) {
            this[key] = options[key];
        }
        this.id = SnowflakeUtil.generate();
        this.players = [];
        this.events = {
            init: [],
            start: [],
            turn: [],
            end: [],
            join: [],
            leave: [],
            message: [],
            ready: [],
            error: [],
        };
    }
    //methods
    setGuild(guild) {
        this.guild = guild;
    }
    setChannel(channel) {
        this.channel = channel;
    }
    getURL() {
        return process.env.BASE_URL + "/game/" + this.id;
    }
    on(event, callback) {
        this.events[event].push(callback);
    }
    async addPlayer(id) {
        if (!(await this.canUserJoin(id))) return false;
        
        if (this.players.length >= this.maxPlayers) {
            this.emit('error', 'Game is full');
            return false;
        }
        if (this.players.filter(player => player.id === id).length > 0) {
            this.emit('error', 'Player already in game');
            return false;
        }

        var discordUser = await discordApiUtils.fetchUser(id);
        var player = new Player(id, discordUser);

        this.players.push(player);
        this.emit('join', player);

        return true;
    }
    getStartMessage() {
        var embed = new MessageEmbed()
            .setTitle(this.name)
            .setDescription(this.description)
            .setColor(this.color || '#0099ff');
        var startGameButton = new MessageButton()
            .setLabel('Play')
            .setStyle('LINK')
            .setURL(this.getURL());

        var row = new MessageActionRow().addComponents([startGameButton]);
        return { embeds: [embed], components: [row] };
    }
    init() {
        gamesManager.addGame(this);
        this.emit('init');
    }
    emit(event, ...args) {
        for (let callback of this.events[event]) {
            callback(...args);
        }
    }
    start() {
        //once first action has been made, start the game
        //first start and then handle first action
    }
    end() {
        //end the game
    }
    async canUserJoin(id) {
        var members = this.guild.members;

        //get discord user id
        var discordUser = await discordApiUtils.fetchUser(id);
        var member = await members.fetch(discordUser.id);

        if (!member) return false;

        const hasPermissionInChannel = this.channel
            .permissionsFor(member)
            .has('SEND_MESSAGES', false);

        return hasPermissionInChannel;
    }
}

module.exports = Game;