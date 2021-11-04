function checkWinner(game) {
    var board = game.data.board;

    //check rows
    for (var i = 0; i < 3; i++) {
        if (board[i][0] !== null && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
            return board[i][0];
        }
    }
    //check columns
    for (var i = 0; i < 3; i++) {
        if (board[0][i] !== null && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
            return board[0][i];
        }
    }
    //check diagonals
    if (board[0][0] !== null && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
        return board[0][0];
    }
    if (board[0][2] !== null && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
        return board[0][2];
    }

    // if everything is full draw
    var full = true;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (board[i][j] === null) {
                full = false;
            }
        }
    }
    if (full) {
        return -1;
    }
}

async function place(game, action) {

    var board = game.data.board;

    var row = action.data.row;
    var col = action.data.col;

    if (board[row][col] !== null) {
        return false; // already taken
    } else {
        board[row][col] = action.playerIndex;
        game.client.emit('place', game, row, col);

        var winner = checkWinner(game);
        if (winner !== null && winner !== undefined) {
            game.end({
                winner: winner
            });

        } else {
            game.endTurn();
        }

        return game;
    }
};

async function select(game, action) {
    var board = game.data.board;

    var row = action.data.row;
    var col = action.data.col;

    if (board[row][col] !== null) {
        return false;
    } else {
        game.client.emit('select', game, row, col);
        return game;
    }
}

const SpaceValue = {
    X: 0,
    O: 1
}

var exports = {
    place: place,
    select: select,
    SpaceValue: SpaceValue
};

if (typeof(module) !== 'undefined') {
    module.exports = exports;
} else {
    window.Common = exports;
}
