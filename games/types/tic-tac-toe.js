//create game for tic-tac-toe

const Game = require('../Game');


var options = {
    name: 'Tic-Tac-Toe',
    description: 'Play Tic-Tac-Toe with your friends!',
    aliases: ['ttt'],
    id: 'tictactoe',
    maxPlayers: 2,
    minPlayers: 2
};

class TicTacToeGame extends Game {
    constructor() {
        super(options);
        this.on('init', () => {
            console.log(this.name + ' has been initialized with id ' + this.id);
        });
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.turn = 0;
        this.players = [];
        this.winner = null;
        this.draw = false;
        this.moves = 0;
    }

    //check if the game is over
    isOver() {
        return this.winner !== null || this.draw;
    }

    //check if the game is draw
    isDraw() {
        return this.draw;
    }

    //check if the game is won
    isWon() {
        return this.winner !== null;
    }

    //check if the game is won
    getWinner() {
        return this.winner;
    }

    //check if the game is won
    getTurn() {
        return this.turn;
    }

    //check if the game is won
    getBoard() {
        return this.board;
    }

    //check if the game is won
    getMoves() {
        return this.moves;
    }

    //check if the game is won
    getPlayers() {
        return this.players;
    }

    //check if the game is won
    getPlayer(id) {
        return this.players.find(p => p.id === id);
    }

    //check if the game is won
    getPlayerIndex(id) {
        return this.players.findIndex(p => p.id === id);
    }

    //check if the game is won
    getPlayerByIndex(index) {
        return this.players[index];
    }

    //check if the game is won
    getPlayerByName(name) {
        return this.players.find(p => p.name === name);
    }
}

module.exports = {
    options,
    Game: TicTacToeGame
};