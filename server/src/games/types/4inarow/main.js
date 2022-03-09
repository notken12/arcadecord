// Import common module for this game type
import Common from './common.js';

// Import Game class
import Game from '../../Game.js';

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';

import Canvas from 'canvas';

// get __dirname
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const options = {
  typeId: "4inarow",
  name: "Four in a Row",
  description: "Get 4 in a row to win!",
  aliases: ['connect4', '4inarow'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '🔵',
  data: {
    board: new Common.Board(7, 6),
    colors: [1,0]
  }
};

class FourInARowGame extends Game {
  constructor(config) {
    super(options, config);

    this.on("init", Game.eventHandlersDiscord.init);
    this.on("turn", Game.eventHandlersDiscord.turn);

    this.setActionModel('place', Common.place);
    this.setActionSchema('place', {
      type: "object",
      properties: {
        col: {
          type: "number",
          minimum: 0,
          maximum: 69
        }
      },
      required: ["col"]
    })

    this.getThumbnail = async function () {
      const canvas = Canvas.createCanvas(Game.thumbnailDimensions.width, Game.thumbnailDimensions.height)
      const ctx = canvas.getContext('2d')

      let board = this.data.board;

      let cellBackgroundSrc = path.resolve(__dirname + '../../../../public/assets/4inarow/CellBackground.svg')
      let cellBackground = await Canvas.loadImage(cellBackgroundSrc)

      let cellFrontSrc = path.resolve(__dirname + '../../../../public/assets/4inarow/CellFront.svg')
      let cellFront = await Canvas.loadImage(cellFrontSrc)

      let redCheckerSrc = path.resolve(__dirname + '../../../../public/assets/4inarow/RedChecker.svg')
      let redChecker = await Canvas.loadImage(redCheckerSrc)

      let yellowCheckerSrc = path.resolve(__dirname + '../../../../public/assets/4inarow/YellowChecker.svg')
      let yellowChecker = await Canvas.loadImage(yellowCheckerSrc)

      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 6; j++) {
          ctx.drawImage(cellBackground, 45 + 30 * i, 10 + 30 * j, 30, 30)
        }
      }

      for (let i = 0; i < board.pieces.length; i++) {
        let checkerType = yellowChecker;
        if (board.pieces[i].color === 1) checkerType = redChecker
        let col = board.pieces[i].col;
        let row = Common.reversedRows(this)[board.pieces[i].row]

        ctx.drawImage(checkerType, 45 + 30 * col, 10 + 30 * row, 30, 30)
      }

      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 6; j++) {
          ctx.drawImage(cellFront, 45 + 30 * i, 10 + 30 * j, 30, 30)
        }
      }


      return canvas;
    }
  }
  onInit(game) {
    // game.data.board.pieces[0] = new Common.Piece(0, 0, 0)
    return game;
  }
}

export default {
  options: options,
  Game: FourInARowGame
}
