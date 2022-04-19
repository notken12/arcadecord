// main.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Import common module for this game type
import Common from './common.js';

// Import Game class
import Game from '../../Game.js';

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';

// get __dirname
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const options = {
  typeId: '4inarow',
  name: 'Four in a Row',
  description: 'Get 4 in a row to win!',
  aliases: ['connect4', '4inarow'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '<:4inarow:956316582064291881>',
  data: {
    board: new Common.Board(7, 6),
    colors: [1, 0],
    mostRecentPiece: undefined,
  },
};

class FourInARowGame extends Game {
  constructor(config) {
    super(options, config);

    this.on('init', Game.eventHandlersDiscord.init);
    this.on('turn', Game.eventHandlersDiscord.turn);

    this.setActionModel('place', Common.place);
    this.setActionSchema('place', {
      type: 'object',
      properties: {
        col: {
          type: 'number',
          minimum: 0,
          maximum: 69,
        },
      },
      required: ['col'],
    });

    this.getThumbnail = async function () {
      const { default: Canvas } = await import('canvas');

      const canvas = Canvas.createCanvas(
        Game.thumbnailDimensions.width,
        Game.thumbnailDimensions.height
      );
      const ctx = canvas.getContext('2d');

      let board = this.data.board;

      let cellBackgroundSrc = path.resolve(
        __dirname + '../../../../public/assets/4inarow/FullBack.svg'
      );
      let cellBackground = await Canvas.loadImage(cellBackgroundSrc);

      let cellFrontSrc = path.resolve(
        __dirname + '../../../../public/assets/4inarow/FullFront.svg'
      );
      let cellFront = await Canvas.loadImage(cellFrontSrc);

      let redCheckerSrc = path.resolve(
        __dirname + '../../../../public/assets/4inarow/RedChecker.svg'
      );
      let redChecker = await Canvas.loadImage(redCheckerSrc);

      let yellowCheckerSrc = path.resolve(
        __dirname + '../../../../public/assets/4inarow/YellowChecker.svg'
      );
      let yellowChecker = await Canvas.loadImage(yellowCheckerSrc);

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let bh = canvas.height - 32; // board height
      let bw = (bh * board.width) / board.height; // board width

      let tlx = canvas.width / 2 - bw / 2; // top left x
      let tly = canvas.height / 2 - bh / 2; // top left y

      ctx.shadowBlur = 6;
      ctx.shadowColor = 'gray';
      ctx.shadowOffsetY = 2;

      ctx.drawImage(cellBackground, tlx, tly, bw, bh);

      for (let i = 0; i < board.pieces.length; i++) {
        let checkerType = yellowChecker;
        if (board.pieces[i].color === 1) checkerType = redChecker;
        let col = board.pieces[i].column;
        let row = Common.reversedRows(this)[board.pieces[i].row];

        ctx.drawImage(
          checkerType,
          tlx + (col / board.width) * bw,
          tly + (row / board.height) * bh,
          (1 / board.width) * bw,
          (1 / board.height) * bh
        );
      }

      ctx.drawImage(cellFront, tlx, tly, bw, bh);
      ctx.shadowBlur = 0;

      return canvas;
    };
  }
  onInit(game) {
    return game;
  }
}

export default {
  options: options,
  Game: FourInARowGame,
};
