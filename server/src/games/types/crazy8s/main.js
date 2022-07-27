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
        index: {
          type: 'number',
        },
        wildColor: {
          type: 'string',
        },
      },
      required: ['index'],
    });
  }

  onReady(game) {
    game.data.drawPile = '';
    game.data.discardPile = '';
    game.data.hands = [];
    game.data.direction = 'standard';

    let pile = [];

    let colors = 'rgby';
    let discriminants = '!@#$';
    // For each color
    for (let i = 0; i < 4; i++) {
      //Base Cards
      // Two copies of each colored card, besides zeroes
      for (let k = 0; k < 2; k++) {
        // 1-9
        for (let j = 1; j < 10; j++) {
          pile.push(new Common.Card('_', colors[i], j, discriminants[k]));
        }
        // Skip, reverse, +2
        pile.push(new Common.Card('s', colors[i], 0, discriminants[k]));
        pile.push(new Common.Card('r', colors[i], 0, discriminants[k]));
        pile.push(new Common.Card('2', colors[i], 0, discriminants[k]));
      }
      // 0
      pile.push(new Common.Card('_', colors[i], 0, '0'));
    }
    for (let k = 0; k < 4; k++) {
      // 4 wild cards
      pile.push(new Common.Card('w', '_', 0, discriminants[k]));
      // 4 +4 cards
      pile.push(new Common.Card('4', '_', 0, discriminants[k]));
    }

    let shuffled = Common.Card.shuffleArray(pile, 1);

    let encoded = Common.Card.encodeArray(shuffled);
    game.data.drawPile = encoded;

    for (let i = 0; i < game.players.length; i++) {
      game.data.hands[i] = {
        cards: [],
      };
    }
    Common.dealCards(game);
    // take top card of draw pile and add to discard as starting card

    let card = Common.drawTopCard(game);
    game.data.discardPile = Common.Card.encode(card) + game.data.discardPile;

    // array sets list of cards not allowed on first draw
    let invalid_cards = ['w', '2', '4', 's', 'r'];
    // if any of these invalid cards are selected, loop through till valid card is selected
    while (invalid_cards.includes(card.type)) {
      card = Common.drawTopCard(game);
      game.data.discardPile = Common.Card.encode(card) + game.data.discardPile;
    }
  }

  async getThumbnail() {}
}

export default {
  options,
  Game: Crazy8s,
};
