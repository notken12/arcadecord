// Import common module for this game type
import Common from './common.js' // <- ctrl+click to jump to this file

// Import Game class
import Game from '../../Game.js'

// Snippet to make __dirname available
// get __dirname
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename)

// Game options, REQUIRED. Export as options
// see README.md
const options = {
  typeId: 'cuppong',
  name: 'Cup Pong',
  description: 'Play a game of Cup Pong with a friend',
  aliases: ['beerpong', 'pong', 'cup'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '🥤',
  data: {},
}

// Game constructor, extends base Game class
// Don't forget to super(options);
class CupPongGame extends Game {
  constructor(config) {
    // Creates a game with the options
    // REQUIRED
    super(options, config) // Config is the options given by the user, and other things like the channel and guild

    // Use default Discord event handlers
    this.on('init', Game.eventHandlersDiscord.init)
    this.on('turn', Game.eventHandlersDiscord.turn)

    // Set the action model for the 'throw' action
    // See common.js
    this.setActionModel('throw', Common.action_throw)
    // Set the action schema for the 'throw' action
    // action.data will be checked against this schema
    // See https://ajv.js.org/
    this.setActionSchema('throw', {
      type: 'object',
      properties: {
        force: {
          // Use for replaying action, not important to the server
          type: 'object',
          properties: {
            x: {
              type: 'number',
            },
            y: {
              type: 'number',
            },
            z: {
              type: 'number',
            },
          },
          required: ['x', 'y', 'z'],
        },
        knockedCup: {
          type: 'string',
        },
      },
      required: ['force'],
    })
  }

  // Use this function to create the game data
  onInit(game) {
    game.data = {
      sides: [
        {
          color: 'red',
          cups: [],
          throwCount: 0,
          throwsMade: 0,
          lastKnocked: '',
          inRedemption: false,
          ballsBack: false,
        },
        {
          color: 'blue',
          cups: [],
          throwCount: 0,
          throwsMade: 0,
          lastKnocked: '',
          inRedemption: false,
          ballsBack: false,
        },
      ],
    }

    //       rowPos 0
    // rowNum 3:    c
    // rowNum 2:   c c
    // rowNum 1:  c c c
    // rowNum 0: c c c c
    //       rowPos 0

    game.data.sides.forEach((side) => {
      for (let rowNum = 0; rowNum < 4; rowNum++) {
        // Row 0 is the back row
        let cupCount = 4 - rowNum
        // rowPos 0 is the center of the row

        let offset = 0.5
        for (
          let rowPos = -cupCount / 2 + offset;
          rowPos <= cupCount / 2 - offset;
          rowPos++
        ) {
          let cup = new Common.Cup(
            `${side.color}:${rowNum}-${rowPos}`,
            side.color,
            rowNum,
            rowPos
          )
          side.cups.push(cup)
        }
      }
    })
  }

  // Optionally define a getThumbnail function to return a thumbnail for the game
  async getThumbnail() {
    const { default: Canvas } = await import('canvas')

    const canvas = Canvas.createCanvas(
      Game.thumbnailDimensions.width,
      Game.thumbnailDimensions.height
    )
    const ctx = canvas.getContext('2d')

    let thumbnailSrc = path.resolve(
      __dirname,
      '../../../public/assets/cuppong/thumbnail.png'
    )
    let thumbnailImg = await Canvas.loadImage(thumbnailSrc)

    ctx.drawImage(thumbnailImg, 0, 0, canvas.width, canvas.height)

    return canvas
  }
}

// REQUIRED: export the options and the game class as Game
export default {
  options,
  Game: CupPongGame,
}
