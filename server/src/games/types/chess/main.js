// main.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Import common module for this game type
import Common from './common.js'

// Import Game class
import Game from '../../Game.js'

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js'

//Import Canvas
//import Canvas from '../../../../../canvas/canvas.js'

// get __dirname
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename)

const options = {
  typeId: 'chess',
  name: 'Chess',
  description: 'Play Chess With Friends!',
  aliases: ['cheese'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '<:chess:956316582093668382>',
  data: {
    // Populate on init
  },
}

class Chess extends Game {
  constructor(config) {
    super(options, config)

    this.on('init', Game.eventHandlersDiscord.init)
    this.on('turn', Game.eventHandlersDiscord.turn)

    this.setActionModel('movePiece', Common.movePiece)
    this.setActionSchema('movePiece', {
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
              minLength: 1,
            },
            capture: {
              type: 'boolean',
            },
            double: {
              type: 'boolean',
            },
          },
          required: ['from', 'to', 'pieceType'],
        },
      },
      required: ['move'],
    })

    this.getThumbnail = async function () {
      /*
      var canvas = Canvas.newCanvas(Game.thumbnailDimensions.width, Game.thumbnailDimensions.height)

      var rectangle = new Canvas.Component(0, 0, Game.thumbnailDimensions.width/1.5, Game.thumbnailDimensions.height, {type:"image", imageSource:"../server/src/assets/chess/bb.png"})
      canvas.draw(rectangle)

      return canvas.toBuffer();
      */

      const { default: Canvas } = await import('canvas')

      const canvas = Canvas.createCanvas(
        Game.thumbnailDimensions.width,
        Game.thumbnailDimensions.height
      )
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      let boardSrc = path.resolve(
        __dirname,
        '../../../public/assets/chess/board.svg'
      )
      let boardImg = await Canvas.loadImage(boardSrc)
      ctx.shadowBlur = 5
      ctx.shadowColor = '#000000ee'

      ctx.drawImage(boardImg, 54, 8, 184, 184)

      let whitePiecesSrc = path.resolve(
        __dirname,
        '../../../public/assets/chess/white_pieces.svg'
      )
      let blackPiecesSrc = path.resolve(
        __dirname,
        '../../../public/assets/chess/black_pieces.svg'
      )

      ctx.shadowBlur = 3
      ctx.shadowOffsetY = 2

      let whitePieces = await Canvas.loadImage(whitePiecesSrc)
      let blackPieces = await Canvas.loadImage(blackPiecesSrc)
      var i
      for (i = 0; i < this.data.board.length; i++) {
        let pieceNumber = 0
        if (this.data.board[i].type == 'r') {
          pieceNumber = 1
        } else if (this.data.board[i].type == 'n') {
          pieceNumber = 2
        } else if (this.data.board[i].type == 'b') {
          pieceNumber = 3
        } else if (this.data.board[i].type == 'q') {
          pieceNumber = 4
        } else if (this.data.board[i].type == 'k') {
          pieceNumber = 5
        }
        if (this.data.board[i].color === 0) {
          //White
          ctx.drawImage(
            whitePieces,
            100 * pieceNumber,
            0,
            100,
            100,
            54 + this.data.board[i].file * 23,
            169 - this.data.board[i].rank * 23,
            23,
            23
          )
        } else {
          //Black
          ctx.drawImage(
            blackPieces,
            100 * pieceNumber,
            0,
            100,
            100,
            54 + this.data.board[i].file * 23,
            169 - this.data.board[i].rank * 23,
            23,
            23
          )
        }
      }

      return canvas
    }

    // this.setActionModel("resign", Common.resign)
    // this.setActionModel("offerDraw", Common.offerDraw)
    // this.setActionModel("drawDecision", Common.drawDecision)
    // this.setActionModel("cancelDraw", Common.cancelDraw)
  }

  onInit(game) {
    game.data.drawoffered = [false, undefined] //[Draw offered or not: bool, Player who offered draw: 0 or 1]
    game.data.previousMoves = []
    game.data.previousBoardPos = []
    game.data.board = []
    game.data.colors = [1, 0]

    const frontRow = 'pppppppp'
    const backRow = 'rnbqkbnr'

    for (let color = 0; color < 2; color++) {
      for (let file = 0; file < 8; file++) {
        let frontRowRank = color === 0 ? 1 : 6
        let backRowRank = color === 0 ? 0 : 7
        game.data.board.push(
          new Common.Piece(
            `${frontRow[file]}${color}:${file}-${frontRowRank}`,
            color,
            frontRow[file],
            file,
            frontRowRank
          )
        )
        game.data.board.push(
          new Common.Piece(
            `${backRow[file]}${color}:${file}-${backRowRank}`,
            color,
            backRow[file],
            file,
            backRowRank
          )
        )
      }
    }
    return game
  }
}

export default {
  options,
  Game: Chess,
}
