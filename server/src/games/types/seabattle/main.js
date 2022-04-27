// main.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Import common module for this game type
import Common from './common.js'

// Import Game class
import Game from '../../Game.js'

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename)

class HitBoard {
  constructor(playerIndex, width, height) {
    this.playerIndex = playerIndex
    this.width = width
    this.height = height

    var i = playerIndex

    var h = Common.SHIP_DIRECTION_HORIZONTAL
    var v = Common.SHIP_DIRECTION_VERTICAL

    this.revealedShips = []

    this.cells = []
    for (var row = 0; row < height; row++) {
      this.cells[row] = []
      for (var col = 0; col < height; col++) {
        this.cells[row][col] = {
          state: Common.BOARD_STATE_EMPTY,
          col,
          row,
          id: col + '-' + row,
        }
      }
    }
  }
}

// use Game options schema

const options = {
  name: 'Sea Battle',
  description: "Strike down your opponent's hidden ships!",
  aliases: ['battleship'],
  typeId: 'seabattle',
  maxPlayers: 2,
  minPlayers: 2,
  data: {
    hitBoards: [
      // the map of hits and misses
      new HitBoard(0, 10, 10),
      new HitBoard(1, 10, 10),
    ],
    availableShips: [],
    placed: [false, false],
    boards: [
      // the map of ships
      new Common.ShipPlacementBoard(10, 10),
      new Common.ShipPlacementBoard(10, 10),
    ],
  },
  emoji: '<:seabattle:956316581842014249>',
}

class SeaBattleGame extends Game {
  constructor(config) {
    super(options, config)

    this.on('init', Game.eventHandlersDiscord.init)

    this.on('turn', Game.eventHandlersDiscord.turn)

    this.setActionModel('placeShips', Common.action_placeShips)
    this.setActionSchema('placeShips', {
      type: 'object',
      properties: {
        shipPlacementBoard: {
          type: 'object',
          properties: {
            width: {
              type: 'number',
            },
            height: {
              type: 'number',
            },
            ships: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                  len: {
                    type: 'number',
                  },
                  type: {
                    type: 'string',
                  },
                  playerIndex: {
                    type: 'number',
                  },
                  dir: {
                    type: 'number',
                    minimum: 0,
                    maximum: 3,
                  },
                  row: {
                    type: 'number',
                  },
                  col: {
                    type: 'number',
                  },
                  sunk: {
                    type: 'boolean',
                  },
                },
              },
            },
          },
          required: ['ships'],
        },
      },
      required: ['shipPlacementBoard'],
    })

    this.setActionModel('shoot', Common.shoot)
    this.setActionSchema('shoot', {
      type: 'object',
      properties: {
        row: {
          type: 'number',
          minimum: 0,
          maximum: 9,
        },
        col: {
          type: 'number',
          minimum: 0,
          maximum: 9,
        },
      },
      required: ['row', 'col'],
    })

    this.getThumbnail = async function () {
      const { default: Canvas } = await import('canvas')

      const canvas = Canvas.createCanvas(
        Game.thumbnailDimensions.width,
        Game.thumbnailDimensions.height
      )
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      let thumbnailSrc = path.resolve(
        __dirname,
        '../../../public/assets/seabattle/SeaBattleThumbnail.png'
      )
      let thumbnail = await Canvas.loadImage(thumbnailSrc)
      ctx.drawImage(thumbnail, 0, 0, canvas.width, canvas.height)

      return canvas
    }
  }

  onInit(game) {
    game.data = {
      hitBoards: [
        // the map of hits and misses
        new HitBoard(0, 10, 10),
        new HitBoard(1, 10, 10),
      ],
      placed: [false, false],
      shipBoards: [
        // the map of ships
        new Common.ShipPlacementBoard(10, 10),
        new Common.ShipPlacementBoard(10, 10),
      ],
    }
    return game
  }
}

export default {
  options: options,
  Game: SeaBattleGame,
}
