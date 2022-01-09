import * as lodash from 'lodash';
import { io } from "socket.io-client";
import './GameFlow.js';

var socket = io();

class Action {
    constructor(type, data, playerIndex) {
        this.type = type;
        this.data = data;
        this.playerIndex = playerIndex;
    }
}

const client = {
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
    }
}

const utils = {
    getGameId: function (location) {
        return location.pathname.split('/')[2];
    },
    propertiesToIgnore: ['client', 'actionModels'],
    functionsToApplyToGame: {
        isItUsersTurn(a, i) {
            return this.turn == i || (!this.hasStarted && !this.isGameFull() && i == -1);
        },
        isItMyTurn() {
            return !this.hasEnded && this.isItUsersTurn(undefined, this.myIndex);
        },
        isGameFull() {
            return this.players.length >= this.maxPlayers;
        }
    },

    async setUpGame(game) {
        var path = `/gamecommons/${game.typeId}`;
        let {default: Common} = await import(path);

        game.client = client;

        for (let key in game.actionModels) {
            game.actionModels[key] = Common[game.actionModels[key]];
        }

        for (let key in game.clientActionModels) {
            game.clientActionModels[key] = Common[game.clientActionModels[key]];
        }

        for (let key in this.functionsToApplyToGame) {
            game[key] = this.functionsToApplyToGame[key].bind(game);
        }

        return game;
    },
    updateGame(game, g) { // write up-to-date data into game
        for (let prop in g) {
            if (utils.propertiesToIgnore.includes(prop)) {
                continue;
            }
            game[prop] = g[prop];
        }
    }
}

var actionEmissionQueue = [];

function emitAction(game, actionType, actionData, actionCallback) {
    actionEmissionQueue.push([actionType, actionData]);

    var firstActionEmitted = false;

    function callback(...args) {
        if (firstActionEmitted) { 
            if (typeof actionCallback === 'function') 
                actionCallback(...args) 
        };
        if (actionEmissionQueue.length > 0) {
            var action = actionEmissionQueue.shift();
            socket.emit('action', action[0], action[1], callback);
        }
        firstActionEmitted = true;
    }

    if (actionEmissionQueue.length === 1) { // start the chain
        callback();
    }
}

var discordUser;

async function runAction(game, type, data, callback, clone) {
    var game = clone ? _.cloneDeep(game) : game;

    if (game.hasEnded || !game.isItUsersTurn(undefined, game.myIndex)) {
        return false;
    }

    var index = game.myIndex;

    if (game.myIndex == -1) { // same code as in handleAction in Game.js: if game hasn't started, start game with this action
        if (game.hasStarted == false) {
            game.players.push({ discordUser: discordUser });
            index = game.players.length - 1;
            game.myIndex = index;

            GameFlow.start(game);
        }
    }

    if (!game.actionModels[type]) {
        console.error(`There's no action model for type "${type}". Try:\n - Checking if you misspelled the action type.\n - Checking if you're missing an action model for this game. If so, you'll need to write one!\nRemember that common action models need to be functions from common.js`);
        return false;
    }

    var success = await game.actionModels[type](game, new Action(type, data, index));
    if (!success) {
        return false;
    }

    if (game.clientActionModels[type]) {
        var success = await game.clientActionModels[type](game, new Action(type, data, index));

        if (!success) return false;
    }
    emitAction(game, type, data, callback);
    return game;
}

async function connect(gameId, callback) {
    socket.emit('connect_socket', {
        gameId: gameId
    }, async (response) => {
        if (response.status != 'success') {
            console.log(response.status);
            return;
        }

        var game = response.game;

        game = await utils.setUpGame(game);

        discordUser = response.discordUser;

        callback({
            game, discordUser
        });
    });
}

export {
    socket,
    utils,
    emitAction,
    runAction,
    connect
}
