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

//Import Canvas
//import Canvas from '../../../../../canvas/canvas.js'

// get __dirname
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const options = {
  typeId: 'crazy8s',
  name: 'Crazy Eights',
  description: 'Be the first to rid all of your cards in CRAZY 8s!',
  aliases: ['uno', 'crazy8s'],
  minPlayers: 2,
  maxPlayers: Infinity,
  emoji: '🃏',
  data: {
    // Populate on init
  },
  hidden: true,
};

class Crazy8s extends Game {
  constructor(config) {
    super(options, config);

    this.on('init', Game.eventHandlersDiscord.init);
    this.on('turn', Game.eventHandlersDiscord.turn);

    this.setActionModel('place', Common.place);
    this.setActionSchema('place', {
      type: 'object',
      properties: {
        value: {
          type: 'number',
          maximum: 9,
          minimum: 0,
        },
        color: {
          type: 'number',
          minimum: 0,
          maximum: 4,
        },
      },
    });

    this.getThumbnail = async function () {};
  }

  onInit(game) {
    game.data.cardPile = [];
    game.data.deck = [];
    game.data.playerHands = [];
    game.data.direction = 'standard';

    var i;
    for (i = 0; i < 4; i++) {
      //Base Cards
      var j;
      for (j = 0; j < 10; j++) {
        game.data.deck.push(Common.Card(j, i));
        game.data.deck.push(Common.Card(j, i));
      }
      game.data.deck.push(Common.Card('skip', i));
      game.data.deck.push(Common.Card('skip', i));
      game.data.deck.push(Common.Card('reverse', i));
      game.data.deck.push(Common.Card('reverse', i));
      game.data.deck.push(Common.Card('+2', i));
      game.data.deck.push(Common.Card('+2', i));
    }
    game.data.deck.push(Common.Card('wild', 4));
    game.data.deck.push(Common.Card('wild', 4));
    game.data.deck.push(Common.Card('wild4', 4));
    game.data.deck.push(Common.Card('wild4', 4));
    Common.shuffle(game.data.deck);
  }
}

export default {
  options,
  Game: Crazy8s,
};
