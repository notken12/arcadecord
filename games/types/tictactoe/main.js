//create game for tic-tac-toe

const Game = require('../../Game');
const Common = require('./common');
const Canvas = require('canvas');

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

        this.getThumbnail = async function () {
            const canvas = Canvas.createCanvas(Game.thumbnailDimensions.width, Game.thumbnailDimensions.height);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const background = await Canvas.loadImage(__dirname + '/images/thumbnail-bg.png');
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            var board = this.data.board;
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    if (board[i][j] !== null) {
                        var symbol = board[i][j] === 0 ? 'x' : 'o';
                        var image = await Canvas.loadImage(__dirname + '/images/' + symbol + '.png');

                        var x = Game.thumbnailDimensions.width / 2 + (j - 1) * 80 - image.width / 2;
                        var y = Game.thumbnailDimensions.height / 2 + (i - 1) * 80 - image.height / 2;
                        ctx.drawImage(image, x, y, image.width, image.height);
                    }
                }
            }

            return canvas.toBuffer();
        }
    }
}

module.exports = {
    options,
    Game: TicTacToeGame
};