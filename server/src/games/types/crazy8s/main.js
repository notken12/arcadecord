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
  aliases: ['crazy8s'],
  minPlayers: 2,
  maxPlayers: Infinity,
  emoji: '🃏',
  data: {
    // Populate on init
  },
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
    game.data.drawPile = '';
    game.data.discardPile = '';
    game.data.hands = [];
    game.data.direction = 'standard';

    let pile = [];
    var i;

    let colors = 'rgby';
    // For each color
    for (i = 0; i < 4; i++) {
      //Base Cards
      var j;
      for (j = 0; j < 10; j++) {
        pile.push(new Common.Card(colors[i], j));
        pile.push(new Common.Card(colors[i], j));
      }
      pile.push(new Common.Card('s', i));
      pile.push(new Common.Card('s', i + 4));
      pile.push(new Common.Card('R', i));
      pile.push(new Common.Card('R', i + 4));
      pile.push(new Common.Card('2', i));
      pile.push(new Common.Card('2', i + 4));
    }
    pile.push(new Common.Card('w', 0));
    pile.push(new Common.Card('w', 1));
    pile.push(new Common.Card('4', 0));
    pile.push(new Common.Card('4', 1));

    let shuffled = Common.Card.shuffleArray(pile, 1);
    let encoded = Common.Card.encodeArray(shuffled);
    game.data.drawPile = encoded;

    for (let i = 0; i < game.players.length; i++) {
      game.data.hands[i] = {
        cards: [],
      };
    }
    Common.dealCards(game);
  }
}

export default {
  options,
  Game: Crazy8s,
};
