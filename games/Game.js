const { SnowflakeUtil } = require('discord.js');
const dotenv = require('dotenv');
const gamesManager = require('./gamesManager');
const { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } = require('discord.js');
const Player = require('./Player');
const Action = require('./Action');
const discordApiUtils = require('../utils/discord-api');
const Turn = require('./Turn');

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
        this.id = SnowflakeUtil.generate();
        this.players = [];
        this.eventHandlers = {};
        this.actionHandlers = {};
        this.turn = 1;
        this.sockets = {};
        this.hasStarted = false;
        this.data = {}; // game position, scores, etc
        this.turns = []; // all past turns taken by players

        this.turns.getDataForClient = function () {
            var data = [];
            for (let turn of this) {
                data.push(turn.getDataForClient());
            }
            return data;
        }

        for (let key in options) {
            this[key] = options[key];
        }
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
        if (!this.eventHandlers[event]) this.eventHandlers[event] = [];
        this.eventHandlers[event].push(callback);
    }
    onAction(action, callback) {
        if (!this.actionHandlers[action]) this.actionHandlers[action] = [];
        this.actionHandlers[action].push(callback);
    }
    emit(event, ...args) {
        if (!this.eventHandlers[event]) return;

        for (let callback of this.eventHandlers[event]) {
            callback(...args);
        }
    }
    async handleAction(action) {

        if (action.playerIndex == -1) {
            if (this.hasStarted == false) {
                await this.addPlayer(action.userId);
                action.playerIndex = this.getPlayerIndex(action.userId);

                this.start();

            }
        }

        if (this.turn != action.playerIndex) return;

        if (this.turns.length == 0) {
            // first turn
            this.turns.push(new Turn(action.playerIndex));
        } else if (this.turns[this.turns.length - 1].playerIndex != action.playerIndex) {
            // begin new turn
            this.turns.push(new Turn(action.playerIndex));
        }

        //add action to turn
        this.turns[this.turns.length - 1].actions.push(action);

        if (this.actionHandlers[action.type]) {
            for (let callback of this.actionHandlers[action.type]) {
                callback(action);
            }
        }
    }
    async addPlayer(id) {
        if (!(await this.canUserJoin(id))) return false;

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

    start() {
        //once first action has been made, start the game
        //first start and then handle first action
        this.hasStarted = true;
        this.emit('start');
    }
    end() {
        //end the game
    }
    async doesUserHavePermission(id) {
        var members = this.guild.members;

        //get discord user id
        var discordUser = await discordApiUtils.fetchUser(id);
        if (!discordUser) return false;

        var member = await members.fetch(discordUser.id);

        if (!member) return false;

        const hasPermissionInChannel = this.channel
            .permissionsFor(member)
            .has('SEND_MESSAGES', false);

        return hasPermissionInChannel;
    }
    async canUserJoin(id) {
        if (!(await this.doesUserHavePermission(id))) return false;
        if (this.isGameFull()) {
            this.emit('error', 'Game is full');
            return false;
        }
        if (this.players.filter(player => player.id === id).length > 0) {
            this.emit('error', 'Player already in game');
            return false;
        }
        return true;
    }
    async canUserSocketConnect(id) {
        if (!(await this.doesUserHavePermission(id))) return false;

        if (this.isPlayerInGame(id)) {
            return true;
        }

        if (this.isGameFull()) {
            this.emit('error', 'Game is full');
            return false;
        }
        return true;
    }
    isGameFull() {
        return this.players.length >= this.maxPlayers;
    }
    isPlayerInGame(id) {
        return this.players.filter(player => player.id === id).length > 0;
    }
    getPlayerIndex(id) {
        return this.players.indexOf(this.players.filter(player => player.id === id)[0]);
    }
    isItUsersTurn(userId) {
        var i = this.getPlayerIndex(userId);
        return this.turn == i || (!this.hasStarted && !this.isGameFull() && i == -1);
    }
    setSocket(userId, socket) {
        if (this.sockets[userId]) {
            this.sockets[userId].disconnect('you connected on another tab');
        }
        this.sockets[userId] = socket;
        socket.join('game:' + this.id);
        socket.on('action', (type, data) => {
            var action = new Action(type, userId, data, this);
            this.handleAction(action);
        });

    }
    endTurn() {
        this.emit('end_turn');

        this.turn = (this.turn + 1) % this.players.length;

        var player = this.players[this.turn];
        var socket = this.sockets[player.id];

        if (socket) {
            socket.emit('turn', this.turns[this.turns.length - 1].getDataForClient(), this.getDataForClient());
        }
    }
    getDataForClient(userId) {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            image: this.image,
            aliases: this.aliases,
            players: this.players.map(player => player.getDataForClient()),
            maxPlayers: this.maxPlayers,
            minPlayers: this.minPlayers,
            turn: this.turn,
            data: this.data,
            isItMyTurn: this.isItUsersTurn(userId),
            myIndex: this.getPlayerIndex(userId),
            hasStarted: this.hasStarted,
            turns: this.turns.getDataForClient(),
        };
    }
}

module.exports = Game;