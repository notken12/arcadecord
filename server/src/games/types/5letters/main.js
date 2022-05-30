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

// Game options, required. Export as options
// README.md
const options = {
  typeId: '5letters',
  name: 'Five Letters',
  description: "Guess your friend's word before they guess yours!",
  aliases: ['wordle', 'wordgame'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '<:5letters:971037718584889404>',
  data: {},
  hidden: false,
};

// Game constructor, extends base Game class
// Don't forget to super(options);
class FiveLettersGame extends Game {
  constructor(config) {
    // Creates a game with the options
    // Required
    super(options, config); // Config is the options given by the user, and other things like the channel and guild

    this.on('init', Game.eventHandlersDiscord.init);
    this.on('turn', Game.eventHandlersDiscord.turn);

    this.setActionModel('chooseWord', Common.action_chooseWord);
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
    });

    this.setActionModel('guess', Common.action_guess);
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
    });

    this.getThumbnail = async function() {
      const { default: Canvas } = await import('canvas');

      const canvas = Canvas.createCanvas(
        Game.thumbnailDimensions.width,
        Game.thumbnailDimensions.height
      );

      const ctx = canvas.getContext('2d');

      const colors = {
        wrong: '#333',
        else: '#dea335',
        correct: '#4ed230',
        empty: '#666666',
        background: '#1b1b1f',
      };

      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var i;
      var j;
      var zeroGuesses = this.data.guesses[0];
      var oneGuesses = this.data.guesses[1];
      for (i = 0; i < zeroGuesses.length; i++) {
        var hints = zeroGuesses[i].hints;
        for (j = 0; j < 5; j++) {
          switch (hints[j]) {
            case 0:
              ctx.fillStyle = colors.wrong;
              break;
            case 1:
              ctx.fillStyle = colors.else;
              break;
            case 2:
              ctx.fillStyle = colors.correct;
              break;
          }
          ctx.fillRect(20 + j * 22, 55 + i * 22, 18, 18);
        }
      }
      ctx.strokeStyle = colors.empty;
      for (; i < 6; i++) {
        for (j = 0; j < 5; j++) {
          ctx.strokeRect(20 + j * 22, 55 + i * 22, 18, 18);
        }
      }

      for (i = 0; i < oneGuesses.length; i++) {
        var hints = oneGuesses[i].hints;
        for (j = 0; j < 5; j++) {
          switch (hints[j]) {
            case 0:
              ctx.fillStyle = colors.wrong;
              break;
            case 1:
              ctx.fillStyle = colors.else;
              break;
            case 2:
              ctx.fillStyle = colors.correct;
              break;
          }
          ctx.fillRect(170 + j * 22, 55 + i * 22, 18, 18);
        }
      }
      ctx.strokeStyle = colors.empty;
      for (; i < 6; i++) {
        for (j = 0; j < 5; j++) {
          ctx.strokeRect(170 + j * 22, 55 + i * 22, 18, 18);
        }
      }
      ctx.fillStyle = 'white';
      ctx.font = '12px Work Sans';
      ctx.textAlign = 'center';

      var zeroCorrect = false;
      var oneCorrect = false;
      var zeroPicked = true;
      var onePicked = true;

      for (i = 0; i < zeroGuesses.length; i++) {
        if (zeroGuesses[i].word === this.data.answers[1]) {
          zeroCorrect = true;
          break;
        }
      }
      for (i = 0; i < oneGuesses.length; i++) {
        if (oneGuesses[i].word === this.data.answers[0]) {
          oneCorrect = true;
          break;
        }
      }

      if (!this.data.answers[0]) zeroPicked = false;
      if (!this.data.answers[1]) onePicked = false;

      if (oneCorrect) {
        ctx.fillText(this.data.answers[0], 75, 35);
      } else if (!zeroPicked) {
        ctx.fillText('_____', 75, 35);
      } else {
        ctx.fillText('?????', 75, 35);
      }

      if (zeroCorrect) {
        ctx.fillText(this.data.answers[1], 225, 35);
      } else if (!onePicked) {
        ctx.fillText('_____', 225, 35);
      } else {
        ctx.fillText('?????', 225, 35);
      }

      return canvas;
    };
  }

  onInit(game) {
    // Generate new game state
    game.data = {
      answers: [],
      guesses: [[], []],
    };

    return game;
  }
}

export default {
  options,
  Game: FiveLettersGame,
};
