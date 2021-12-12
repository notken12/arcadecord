const { SnowflakeUtil, MessageAttachment } = require('discord.js');
const dotenv = require('dotenv');
const gamesManager = require('./gamesManager');
const Player = require('./Player');
const Action = require('./Action');
const discordApiUtils = require('../utils/discord-api');
const Turn = require('./Turn');
const { cloneDeep } = require('lodash');
//const bot = require('../bot/bot'); will need to replaced with communication with the bot via http
const bases = require('bases');
const GameFlow = require('./GameFlow');
const BotApi = require('../bot/api');
const db = require('../../db/db2');
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
    constructor(typeOptions, options) {
        this.id = bases.toBase62(SnowflakeUtil.generate());
        this.players = [];
        this.eventHandlers = {};
        this.actionHandlers = {};
        this.turn = 1;
        this.sockets = {};
        this.hasStarted = false;
        this.hasEnded = false;
        this.lastTurnInvite = null;
        this.startMessage = null;
        this.winner = null; // will be set to player index
        this.data = {}; // game position, scores, etc
        this.secretData = {}; // data to be kept secret from players clients
        this.turns = []; // all past turns taken by players
        this.actionModels = {}; // actions and their functions to manipulate the game, will be supplied by game type, and sent to client so client can emulate
        
        // async actionModel (action, game) {
        // action: information about action
        // game: game that the action takes place in, whether it be server or client model of game


        // manipulate game data, whether it be server or client data
        // return game, or false if action was unsuccesful
        // }
        this.serverActionModels = {};
        this.clientActionModels = {};

        this.client = {
            eventHandlers: {},
            emit: function (event, ...args) {
                if (!this.eventHandlers[event]) return;

                for (let callback of this.eventHandlers[event]) {
                    callback(...args);
                }
            },
            on: function (event, callback) {
                if (!this.eventHandlers[event]) this.eventHandlers[event] = [];
                this.eventHandlers[event].push(callback);
            },
            getDataForClient: function () {
                return {
                    eventHandlers: this.eventHandlers,
                    emit: this.emit.toString(),
                    on: this.on.toString(),
                };
            }
        }; // event management, just for client. used for updating ui. copy of this can be found in client-framework.js



        Object.assign(this, cloneDeep(typeOptions || {})); // deep clone options so that options wont be changed when game is modified
        Object.assign(this, cloneDeep(options || {})); // deep clone options so that options wont be changed when game is modified

        if (this._id !== undefined && this._id !== null) {
            this.id = this._id;
        }
        if (this.id !== undefined && this.id !== null) {
            this._id = this.id;
        }

        this.turns.getDataForClient = function () {
            var data = [];
            for (let turn of this) {
                data.push(turn.getDataForClient());
            }
            return data;
        }
    }
    //methods
    setGuild(guild) {
        this.guild = guild;
    }
    setChannel(channel) {
        this.channel = channel;
    }
    setActionModel(action, model, side) {
        if (side == 'client') {
            this.clientActionModels[action] = model;
        } else if (side == 'server') {
            this.serverActionModels[action] = model;
        } else {
            this.actionModels[action] = model;
        }
    }
    getURL() {
        return process.env.GAME_SERVER_URL + "/game/" + this.id;
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
        if (this.hasEnded) return {
            success: false
        };

        if (action.playerIndex == -1) {
            if (this.hasStarted == false) {
                await this.addPlayer(action.userId);
                action.playerIndex = this.getPlayerIndex(action.userId);

                GameFlow.start(this);

            }
        }

        if (this.turn !== action.playerIndex) return {
            success: false,
        };

        if (this.turns.length == 0) {
            // first turn
            this.turns.push(new Turn(action.playerIndex));
        } else if (this.turns[this.turns.length - 1].playerIndex != action.playerIndex) {
            // begin new turn
            this.turns.push(new Turn(action.playerIndex));
        }

        //add action to turn
        this.turns[this.turns.length - 1].actions.push(action);

        // run action
        var actionModel = this.actionModels[action.type];

        var actionResult = {};
        if (actionModel) {
            var successful = await actionModel(this, action);

            if (!successful) {
                // action failed

                return {
                    success: false,
                };
            }

            var serverActionModel = this.serverActionModels[action.type];
            if (serverActionModel) {
                var previousData = cloneDeep(this.data);
                var response = await serverActionModel(this, action);

                if (!response) {
                    // action failed

                    return {
                        success: false,
                    };
                } else {
                    if (typeof response[1] == 'object') {
                        actionResult = response[1];
                        actionResult.success = true;
                    } else {
                        actionResult = {
                            success: true,
                            changes: this.getChanges(previousData, this.data),// changes between game data before and after action,
                            game: this.getDataForClient(action.userId)
                        };
                    }
                }



            }
        } else {
            // action not found
            return {
                success: false,
                message: "Action model not found"
            };
        }

        if (this.actionHandlers[action.type]) {
            for (let callback of this.actionHandlers[action.type]) {
                callback(action);
            }
        }

        return actionResult;
    }
    async addPlayer(id) {
        if (!(await this.canUserJoin(id))) return false;

        var user = await db.users.getById(id);
        if (!user) return false;

        var discordUser = await BotApi.fetchUser(user.discordId);
        var player = new Player(id, discordUser);

        this.players.push(player);
        this.emit('join', player);

        return true;
    }
    init() {
        this.emit('init');
    }
    async doesUserHavePermission(id) {
        // MOVE THIS CODE OVER TO THE BOT
        // and send a request to check if user has permission to join

        /*var members = this.guild.members;

        //get discord user id
        var discordUser = await discordApiUtils.fetchUser(bot, id);
        if (!discordUser) return false;

        try {
            var member = await members.fetch(discordUser.id);
        } catch (e) {
            return false;

        }

        if (!member) return false;

        const hasPermissionInChannel = this.channel
            .permissionsFor(member)
            .has('SEND_MESSAGES', false);

        return hasPermissionInChannel;*/
        return true;
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
        return this.players.indexOf(this.players.find(player => player.id.toString() === id.toString()));
    }
    isItUsersTurn(userId, index) {
        var i;
        if (index !== undefined) {
            i = index;
        } else {
            i = this.getPlayerIndex(userId);
        }
        return this.turn == i || (!this.hasStarted && !this.isGameFull() && i == -1);
    }
    setSocket(userId, socket) {
        // TODO: disconnect user's old socket if they have one
        this.sockets[userId] = socket;

    }

    broadcastToAllSockets(event, broadcastGame, ...args) {
        for (let key in this.sockets) {
            if (broadcastGame) {
                this.sockets[key].emit(event, this.getDataForClient(key), ...args);
            } else {
                this.sockets[key].emit(event, undefined, ...args);
            }
        }
    }

    getImage() {

    }

    getChanges(oldData, newData) {
        var changes = {};
        for (let key in newData) {
            if (oldData[key] !== newData[key]) {
                changes[key] = newData[key];
            }
        }
        return changes;
    }

    getDataForClient(userId) {
        var game = {
            id: this.id,
            name: this.name,
            description: this.description,
            image: this.image,
            aliases: this.aliases,
            players: this.players.map(player => Player.getDataForClient(player, userId)),
            maxPlayers: this.maxPlayers,
            minPlayers: this.minPlayers,
            turn: this.turn,
            data: this.data,
            myIndex: this.getPlayerIndex(userId),
            hasStarted: this.hasStarted,
            turns: this.turns.getDataForClient(userId),
            client: this.client.getDataForClient(userId),
            actionModels: {},
            clientActionModels: {},
            winner: this.winner,
            hasEnded: this.hasEnded,
            typeId: this.typeId,
        };
        for (let key in this.actionModels) {
            game.actionModels[key] = this.actionModels[key].name;
        }
        for (let key in this.clientActionModels) {
            game.clientActionModels[key] = this.clientActionModels[key].name;
        }

        return game;
    }

    getThumbnail() {

    }
}

Game.eventHandlersDiscord = {
    init: async function () {
        var game = this;

        var embed = new MessageEmbed()
            .setTitle(game.name)
            .setDescription(game.description)
            .setColor(game.color || '#0099ff');
        var startGameButton = new MessageButton()
            .setEmoji(game.emoji || '🎮')
            .setLabel('Play')
            .setStyle('LINK')
            .setURL(game.getURL());

        var row = new MessageActionRow().addComponents([startGameButton]);
        var message = { embeds: [embed], components: [row] };

        if (typeof (game.getThumbnail) == 'function') {
            var image = await game.getThumbnail();
            if (image) {
                const attachment = new MessageAttachment(image, 'thumbnail.png');

                embed.setImage(`attachment://thumbnail.png`);

                message.files = [attachment];
            }
        }

        var res = await BotApi.sendMessage(message, game.guild, game.channel);

        var msg = await res.json();
        this.startMessage = msg.id;
        console.log('start message: ' + this.startMessage);

        return true;
    },
    turn: async function () {
        /*if (this.startMessage) {
            this.startMessage.delete().catch(() => {});
        }
        if (this.lastTurnInvite) {
            this.lastTurnInvite.delete();
        }

        var lastPlayer = this.turns[this.turns.length - 1].playerIndex;

        var m = {
            content: `<@${this.players[lastPlayer].discordUser.id}>: *${this.emoji + ' ' || ''}${this.name}*`,
            allowedMentions: {
                parse: [],
            }
        }

        this.channel.send(m);

        var embed = new MessageEmbed()
        .setTitle(this.name)
        //.setDescription(`Your turn, <@${this.players[this.turn].discordUser.id}>`)
        .setColor(this.color || '#0099ff')
        .setURL(this.getURL());



        var button = new MessageButton()
        .setLabel('Play')
        .setStyle('LINK')
        .setURL(this.getURL());

        var row = new MessageActionRow().addComponents([button]);

        var invite = {
            content: `Your turn, <@${this.players[this.turn].discordUser.id}>`,
            embeds: [embed], 
            components: [row],
        };

        var image = await this.getThumbnail();
        if (image) {
            const attachment = new MessageAttachment(image, 'thumbnail.png');

            embed.setImage(`attachment://thumbnail.png`);

            invite.files = [attachment];
        }

        var message = await this.channel.send(invite);
        this.lastTurnInvite = message;*/
    }
}

Game.thumbnailDimensions = {
    width: 400,
    height: 300,
};

module.exports = Game;