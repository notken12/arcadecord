// Import common module for this game type
import Common from './common.js';

// Import Game class
import Game from '../../Game.js';

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';

//Import Canvas
import Canvas from 'canvas'

const options = {
  typeId: 'chess',
  name: 'Chess',
  description: 'Play Chess With Friends!',
  aliases: ['cheese'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '♟️',
  data: {
    // Populate on init
  }
}

class Chess extends Game {
  constructor(config) {
    super(options, config);

    this.on('init', Game.eventHandlersDiscord.init);
    this.on('turn', Game.eventHandlersDiscord.turn);

    this.setActionModel("movePiece", Common.movePiece)
    this.setActionSchema("movePiece", {
      type: 'object',
      properties: {
        move: {
          type: 'object',
          properties: {
            from: {
              type: 'array',
            },
            to: {
              type: 'array',
            },
            pieceType: {
              type: 'string',
              maxLength: 1,
              minLength: 1,
            },
            castle: {
              type: 'number',
              maximum: 1,
              minimum: 0,
            },
            promotion: {
              type: 'string',
              maxLength: 1,
              minLength: 1
            },
            capture: {
              type: 'boolean',
            },
            double: {
              type: 'boolean',
            },
          },
          required: ['from', 'to', 'pieceType']
        },
      },
      required: ['move']
    })

    this.getThumbnail = async function () {
      const canvas = Canvas.createCanvas(Game.thumbnailDimensions.width, Game.thumbnailDimensions.height);
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // const background = await Canvas.loadImage(__dirname + '/images/thumbnail-bg.png');
      // ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // var board = this.data.board;
      // for (var i = 0; i < 3; i++) {
      //   for (var j = 0; j < 3; j++) {
      //     if (board[i][j] !== null) {
      //       var symbol = board[i][j] === 0 ? 'x' : 'o';
      //       var image = await Canvas.loadImage(__dirname + '/images/' + symbol + '.png');

      //       var x = Game.thumbnailDimensions.width / 2 + (j - 1) * 80 - image.width / 2;
      //       var y = Game.thumbnailDimensions.height / 2 + (i - 1) * 80 - image.height / 2;
      //       ctx.drawImage(image, x, y, image.width, image.height);
      //     }
      //   }
      // }

      return canvas.toBuffer();
    }

    // this.setActionModel("resign", Common.resign)
    // this.setActionModel("offerDraw", Common.offerDraw)
    // this.setActionModel("drawDecision", Common.drawDecision)
    // this.setActionModel("cancelDraw", Common.cancelDraw)
  }

  onInit(game) {
    game.data.drawoffered = [false, undefined] //[Draw offered or not: bool, Player who offered draw: 0 or 1]
    game.data.previousMoves = [];
    game.data.previousBoardPos = [];
    game.data.board = [];
    game.data.colors = [1, 0];


    const frontRow = 'pppppppp'
    const backRow = 'rnbqkbnr'

    for (let color = 0; color < 2; color++) {
      for (let file = 0; file < 8; file++) {
        let frontRowRank = color === 0 ? 1 : 6;
        let backRowRank = color === 0 ? 0 : 7;
        game.data.board.push(new Common.Piece(`${frontRow[file]}${color}:${file}-${frontRowRank}`, color, frontRow[file], file, frontRowRank));
        game.data.board.push(new Common.Piece(`${backRow[file]}${color}:${file}-${backRowRank}`, color, backRow[file], file, backRowRank));
      }
    }
    return game;
  }
}


export default {
  options,
  Game: Chess
}
