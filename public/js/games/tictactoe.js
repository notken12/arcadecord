import * as Client from '/public/js/client-framework.js';

import '/gamecommons/tictactoe';

var el = {
    spaces: [[], [], []],
    whosTurn: document.querySelector('#whos_turn'),
    result: document.querySelector('#result'),
};

var game;

for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        el.spaces[i][j] = document.querySelector(`#s${i}_${j}`);
        el.spaces[i][j].addEventListener('click', function (e) {
            Client.runAction(game, 'place', {row: i, col: j});
        });
    }
}

function updateUI(game) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            var space = game.data.board[i][j];
            var elSpace = el.spaces[i][j];

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
}

function connectionCallback(response) {
    game = response.game;

    updateUI(game);

    game.client.on('place', (game, row, col) => {
        el.spaces[row][col].innerText = game.myIndex === Common.SpaceValue.X ? 'X' : 'O';
        el.spaces[row][col].classList.remove(game.myIndex === Common.SpaceValue.X ? 'o' : 'x');
        el.spaces[row][col].classList.add(game.myIndex === Common.SpaceValue.X ? 'x' : 'o');
    });

    game.client.on('end_turn', () => {
        var opponent = game.players[game.myIndex === 0 ? 1 : 0];
        if (opponent) {
            el.whosTurn.innerText = `It is ${opponent.discordUser.username}#${opponent.discordUser.discriminator}'s turn`;
        }
    });
}

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