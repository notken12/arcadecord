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

// Game options, required. Export as options
// README.md
const options = {
  typeId: '5letters',
  name: 'Five Letters',
  description: "Guess your friend's word before they guess yours!",
  aliases: ['wordle', 'wordgame'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '🔠',
  data: {},
}

// Game constructor, extends base Game class
// Don't forget to super(options);
class FiveLettersGame extends Game {
  constructor(config) {
    // Creates a game with the options
    // Required
    super(options, config) // Config is the options given by the user, and other things like the channel and guild

    this.on('init', Game.eventHandlersDiscord.init)
    this.on('turn', Game.eventHandlersDiscord.turn)

    this.setActionModel('chooseWord', Common.action_chooseWord)
    this.setActionSchema('chooseWord', {
      type: 'object',
      properties: {
        word: {
          type: 'string',
          minLength: Common.WORD_LENGTH,
          maxLength: Common.WORD_LENGTH,
        },
      },
      required: ['word'],
    })

    this.setActionModel('guess', Common.action_guess)
    this.setActionSchema('guess', {
      type: 'object',
      properties: {
        word: {
          type: 'string',
          minLength: Common.WORD_LENGTH,
          maxLength: Common.WORD_LENGTH,
        },
      },
      required: ['word'],
    })
  }

  onInit(game) {
    // Generate new game state
    game.data = {
      answers: [],
      guesses: [[], []],
    }

    return game
  }
}

export default {
  options,
  Game: FiveLettersGame,
}
