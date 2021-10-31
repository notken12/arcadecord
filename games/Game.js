const { SnowflakeUtil } = require('discord.js');
const dotenv = require('dotenv');
const gamesManager = require('./gamesManager');
const { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } = require('discord.js');


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
    addPlayer(player) {
        if (this.players.length >= this.maxPlayers) {
            this.emit('error', 'Game is full');
            return false;
        }
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
    start () {
        //once first action has been made, start the game
        //first start and then handle first action
    }
    end() {
        //end the game
    }
}

module.exports = Game;