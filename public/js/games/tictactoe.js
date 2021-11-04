import * as Client from '/public/js/client-framework.js';

import '/gamecommons/tictactoe';

var el = {
    spaces: [[], [], []],
    contentSpaces: [[], [], []],
    selectionSpaces: [[], [], []],
    whosTurn: document.querySelector('#whos-turn'),
    result: document.querySelector('#result'),
    buttons: {
        place: document.querySelector('#place'),
    }
};

var game;
var selected = {
    row: null,
    col: null,
};

for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        el.spaces[i][j] = document.querySelector(`#s${i}_${j}`);
        el.spaces[i][j].addEventListener('click', function (e) {
            select(i, j);
        });

        el.contentSpaces[i][j] = el.spaces[i][j].querySelector('.square-content');
        el.selectionSpaces[i][j] = el.spaces[i][j].querySelector('.square-selection');
    }
}

function updateUI(game) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            var space = game.data.board[i][j];
            var elSpace = el.contentSpaces[i][j];

            if (space === Common.SpaceValue.X) {
                elSpace.innerText = 'X';
                elSpace.classList.remove('o');
                elSpace.classList.add('x');
            } else if (space === Common.SpaceValue.O) {
                elSpace.innerText = 'O';
                elSpace.classList.remove('x');
                elSpace.classList.add('o');
            } else {
                elSpace.innerText = '';
                elSpace.classList.remove('x');
                elSpace.classList.remove('o');
            }
        }
    }

    if (!game.hasStarted && !game.isItMyTurn()) {
        el.whosTurn.innerText = 'Waiting for opponent';
        //opponentName.innerText = 'Waiting for opponent';
    }


    if (game.isItMyTurn()) {
        console.log('it is my turn');
        el.whosTurn.innerText = 'It is your turn';
    } else {
        console.log('it is not my turn');
        var opponent = game.players[game.myIndex === 0 ? 1 : 0];
        if (opponent) {
            el.whosTurn.innerText = `It is ${opponent.discordUser.username}#${opponent.discordUser.discriminator}'s turn`;
        }
    }

    if (game.winner !== null && game.winner !== undefined) {
        if (game.winner != -1) {
            var winner = game.players[game.winner];
            el.result.innerText = `${winner.discordUser.username}#${winner.discordUser.discriminator} won!`;
        } else {
            el.result.innerText = 'Draw!';
        }
    }
}

function select(row, col) {
    if (game.data.board[row][col] !== null || !game.isItMyTurn()) {
        return false;
    } else {
        if (selected.row !== null && selected.col !== null) {
            var lastSpace = el.selectionSpaces[selected.row][selected.col];
            lastSpace.classList.remove('selected');

            if (selected.row === row && selected.col === col) {
                selected.row = null;
                selected.col = null;

                el.buttons.place.disabled = true;
                return;
            }
        }

        selected = {
            row, col
        };

        var space = el.selectionSpaces[row][col];
        space.innerText = game.myIndex === Common.SpaceValue.X ? 'X' : 'O';
        space.classList.add(game.myIndex === Common.SpaceValue.X ? 'x' : 'o');
        space.classList.remove(game.myIndex === Common.SpaceValue.X ? 'o' : 'x');
        space.classList.add('selected');

        el.buttons.place.disabled = false;

        return true;
    }
}

function connectionCallback(response) {
    game = response.game;

    updateUI(game);

    game.client.on('place', (game, row, col) => {
        var space = el.contentSpaces[row][col];

        space.innerText = game.myIndex === Common.SpaceValue.X ? 'X' : 'O';
        space.classList.remove(game.myIndex === Common.SpaceValue.X ? 'o' : 'x');
        space.classList.add(game.myIndex === Common.SpaceValue.X ? 'x' : 'o');

        if (selected.row !== null && selected.col !== null) {
            var selectionSpace = el.selectionSpaces[selected.row][selected.col];
            selectionSpace.classList.remove('selected');
        }
    });

    game.client.on('end_turn', () => {
        var opponent = game.players[game.myIndex === 0 ? 1 : 0];
        if (opponent) {
            el.whosTurn.innerText = `It is ${opponent.discordUser.username}#${opponent.discordUser.discriminator}'s turn`;
        }
    });

}

el.buttons.place.addEventListener('click', function (e) {
    if (selected.row !== null && selected.col !== null) {
        Client.runAction(game, 'place', { row: selected.row, col: selected.col });
    }
});

Client.socket.on('turn', (g, turn) => {
    Client.utils.updateGame(game, g);
    updateUI(game);

    console.log(game, turn);
});

Client.socket.on('end', function (g, result, turn) {
    Client.utils.updateGame(game, g);

    if (result.winner != -1) {
        var winner = game.players[result.winner];
        el.result.innerText = `${winner.discordUser.username}#${winner.discordUser.discriminator} won!`;
    } else {
        el.result.innerText = 'Draw!';
    }
});

Client.socket.on('disconnect', function (reason) {
    console.log('socket disconnected because ' + reason);
});


var gameId = window.location.pathname.split('/')[2];

Client.connect(gameId, connectionCallback);