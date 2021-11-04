//create game for tic-tac-toe

const Game = require('../../Game');
const Common = require('./common');

var options = {
    name: 'Tic-Tac-Toe',
    description: 'Play Tic-Tac-Toe with your friends!',
    aliases: ['ttt'],
    typeId: 'tictactoe',
    maxPlayers: 2,
    minPlayers: 2,
    data: {
        board: [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ]
    },
    emoji: '#️⃣'
};

class TicTacToeGame extends Game {
    constructor() {
        super(options);

        this.setActionModel('place', Common.place);

        // this.onAction('place', (action) => {
        //     var player = this.players[action.playerIndex];

        //     this.channel.send(`<@${player.discordUser.id}> placed on (${action.data.row}, ${action.data.col})`);
        // });
        this.on('init', Game.eventHandlersDiscord.init.bind(this));

        this.on('turn', Game.eventHandlersDiscord.turn.bind(this));

        this.on('end', () => {
            var winner = this.players[this.winner];

            if (winner !== -1 && winner !== null && winner !== undefined) {
                this.channel.send(`<@${winner.discordUser.id}> won!`);
            } else {
                this.channel.send('It\'s a draw!');
            }
        });
    }
}

module.exports = {
    options,
    Game: TicTacToeGame
};