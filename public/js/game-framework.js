var socket = io();

class Action {
    constructor(type, data, playerIndex) {
        this.type = type;
        this.data = data;
        this.playerIndex = playerIndex;
    }
}

const utils = {
    propertiesToIgnore: ['client', 'actionModels'],
    functionsToApplyToGame: {
        isItUsersTurn(a, i) {
            return this.turn == i || (!this.hasStarted && !this.isGameFull() && i == -1);
        },
        isGameFull() {
            return this.players.length >= this.maxPlayers;
        },
        endTurn() {
            this.turn = (this.turn + 1) % this.players.length;

        }
    },

    setUpGame(game) {
        eval('game.client.on = ' + game.client.on);
        eval('game.client.emit = ' + game.client.emit);

        for (let key in game.actionModels) {
            eval(`game.actionModels['${key}'] = ` + game.actionModels[key]);
        }

        for (let key in this.functionsToApplyToGame) {
            game[key] = this.functionsToApplyToGame[key].bind(game);
        }
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

function runAction(game, type, data) {
    game.actionModels[type](new Action(type, data, game.myIndex), game).then(function (result) {
        if (result) {
            emitAction(type, data);
        }
    });
}

function connect(callback) {
    socket.emit('connect_socket', {
        gameId: gameId
    }, (response) => {
        if (response.status != 'success') {
            console.log(response.status);
            return;
        }

        var game = response.game;

        utils.setUpGame(game);

        callback(game);
    });
}

