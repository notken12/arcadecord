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
        },
        endTurn() {
            this.turn = (this.turn + 1) % this.players.length;

            this.client.emit('end_turn', this);
        },
        end(result) {
            //end the game
            this.endTurn();

            this.hasEnded = true;
            if (result.winner) {
                this.winner = result.winner;
            } else {
                // draw
                this.winner = -1;
            }

            this.client.emit('end', this, result, this.turns[this.turns.length]);
        },
        start() {
            this.hasStarted = true;
            this.client.emit('start', this);
        }
    },

    async setUpGame(game) {
        var path = `/gamecommons/${game.typeId}`;
        await import(path);

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

function emitAction(actionType, actionData) {
    actionEmissionQueue.push([actionType, actionData]);

    function callback() {
        if (actionEmissionQueue.length > 0) {
            var action = actionEmissionQueue.shift();
            socket.emit('action', action[0], action[1], callback);
        }
    }

    if (actionEmissionQueue.length === 1) { // start the chain
        callback();
    }
}

var discordUser;

async function runAction(game, type, data) {
    if (game.hasEnded || !game.isItUsersTurn(undefined, game.myIndex)) {
        return;
    }

    var index = game.myIndex;

    if (game.myIndex == -1) { // same code as in handleAction in Game.js: if game hasn't started, start game with this action
        if (game.hasStarted == false) {
            game.players.push({ discordUser: discordUser });
            index = game.players.length - 1;
            game.myIndex = index;

            game.start();
        }
    }


    var success = await game.actionModels[type](game, new Action(type, data, index));
    if (!success) {
        return;
    }

    if (game.clientActionModels[type]) {
        var success = await game.clientActionModels[type](game, new Action(type, data, index));

        if (!success) return;
    }
    emitAction(type, data);

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
    Action,
    utils,
    emitAction,
    runAction,
    connect
}
