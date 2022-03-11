// Import common module for this game type
import Common from './common.js';

// Import Game class
import Game from '../../Game.js';

// Import Canvas to draw thumbnail
import Canvas from 'canvas';

// Game options, required. Export as options
// README.md
const options = {
    typeId: 'filler',
    name: 'Filler',
    description: 'Switch the color of squares to dominate the board.',
    aliases: ['switch', 'squaregame'],
    minPlayers: 2,
    maxPlayers: 2,
    emoji: '🟧',
    data: {
        
    }
}

// Game constructor, extends base Game class
// Don't forget to super(options);
class FillerGame extends Game {
    constructor (config) {
        // Creates a game with the options
        // Required
        super(options, config); // Config is the options given by the user, and other things like the channel and guild

        // Generate new board if board doesn't exist
        // if (!this.board) {
        //     this.data = {
        //         board: new Common.Board(16, 9)
        //     };
        // }
        

        this.on('init', Game.eventHandlersDiscord.init);
        this.on('turn', Game.eventHandlersDiscord.turn);

        this.setActionModel('switchColors', Common.action_switchColors);
        this.setActionSchema('switchColors', {
            type: 'object',
            properties: {
                targetColor: {
                    type: 'number',
                    maximum: Common.COLORS.length - 1,
                    minimum: 0
                }
            }
        });
    }

    onInit(game) {
        // Generate new board
        if (!this.board) {
            this.data = {
                board: new Common.Board(8, 7)
            };
        }
        return game
    }

    async getThumbnail() {
        const colors = ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#2979ff', '#d500f9'];

        const canvas = Canvas.createCanvas(Game.thumbnailDimensions.width, Game.thumbnailDimensions.height)
        const ctx = canvas.getContext('2d')
  
        ctx.fillStyle = "#e4e1e6"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        let board = this.data.board;

        const sl = (canvas.height - 32) / board.height;
        const topLeft = {
            x: canvas.width / 2 - sl * board.width / 2,
            y: canvas.height / 2 - sl * board.height / 2
        }

        ctx.shadowBlur = 6;
        ctx.shadowColor = "gray";
        ctx.shadowOffsetX = 0;
        // ctx.shadowOffsetY = 4;
        ctx.fillStyle = "transparent";

        ctx.fillRect(topLeft.x, topLeft.y, board.width * sl, board.height * sl);

        ctx.shadowBlur = 0;

        for (let row = 0; row < board.height; row++) {
            for (let col = 0; col < board.width; col++) {
                let x = topLeft.x + sl * col;
                let y = topLeft.y + sl * row;

                let cell = board.cells[row][col];

                ctx.fillStyle = colors[cell.color];
                ctx.fillRect(x, y, sl, sl);
            }
        }

        return canvas;
    }
}

export default {
    options,
    Game: FillerGame,
}