// common.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import GameFlow from '../../GameFlow.js';
import cloneDeep from 'lodash.clonedeep';

/** @typedef {'_'|'w'|'s'|'r'|'2'|'4'} CardType */
/** @typedef {'_'|'r'|'g'|'b'|'y'} CardColor */

const STARTING_HAND_SIZE = 7;

class Card {
  /** Card's number, for non applicable cards use 0
   * @type number*/
  number;
  /** Type of card (number, wild, skip, reverse, +2, +4)
   * Represent using _,w,s,r,2,4 respectively.
   * @type CardType */
  type;
  /** Color of card (n/a, red, green, blue, yellow)
   * Represent using _,r,g,b,y respectively.
   * @type CardColor */
  color;
  /** Discriminant used to make sure all cards will be encoded uniquely to help vue.js keep track of cards
   * In an Uno deck, there are two copies of all colored cards except zeroes
   * @type string */
  discriminant;
  /** @param {CardType} type
   * @param {CardColor} color
   * @param {number} number
   * @param {string} discriminant */
  constructor(type, color, number, discriminant) {
    this.type = type;
    this.color = color;
    this.number = number;
    this.discriminant = discriminant;
  }

  static ENCODING_LENGTH = 4;

  /** Encodes a card as 2 chars: {type}{number}
   * @param {Card} card */
  static encode(card) {
    return `${card.type}${card.color}${card.number}${card.discriminant}`;
  }

  /** @param {Card[]} cards */
  static encodeArray(cards) {
    return cards.map((c) => Card.encode(c)).join('');
  }

  /** @param {string} str - String to decode from, see Card.encode */
  static decode(str) {
    return new Card(str[0], str[1], parseInt(str[2]), str[3]);
  }

  /** @param {string} str - String to decode from, see Card.encode */
  static decodeArray(str) {
    let arr = [];
    for (let i = 0; i < str.length; i += Card.ENCODING_LENGTH) {
      arr.push(Card.decode(str.substring(i, i + Card.ENCODING_LENGTH)));
    }
    return arr;
  }

  static getCardByIndex(str, i) {
    let card = Card.decode(
      str.substring(i * Card.ENCODING_LENGTH, (i + 1) * Card.ENCODING_LENGTH)
    );
    return card;
  }

  /** @param {Card[]} array */
  /** @param {number} seed */
  static shuffleArray(array, seed) {
    var m = array.length,
      t,
      i;

    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(random(seed) * m--); // <-- MODIFIED LINE

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
      ++seed; // <-- ADDED LINE
    }

    return array;
  }

  /** @param {string} str - String to decode from, see Card.encode */
  static getTopCard(str) {
    return Card.getCardByIndex(str, 0);
  }
}

function random(seed) {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

async function place(game, action) {
  // Get the card the player wants to play from their hand, by index
  let hand = game.data.hands[action.playerIndex];
  let card = Card.getCardByIndex(hand.cards, action.data.index);
  let drawPile = game.data.drawPile;
  let discardPile = game.data.discardPile;
  let topCard = Card.getTopCard(discardPile);

  if (
    topCard.color === card.color ||
    topCard.number === card.number ||
    card.type === 'w' ||
    card.type === '4'
  ) {
    // Same color || same number || wild card || +4 card
    if (card.type == 'r')
      game.data.direction =
        game.data.direction === 'standard' ? 'reverse' : 'standard'; // Reverse game direction
    switch (card.type) {
      // TODO: handle +2/+4: add a pending +2/+4, players can play a +2/+4 to continue the chain or be forced to draw 2 cards
      case '2':
        break;
      case '4':
        // Color selection takes place on client side
        card.color = action.wildColor;
        break;
      case 'w':
        card.color = action.wildColor;
        break;
    }
    if (hand.cards.length === 0) {
      await GameFlow.end(game, {
        winner: game.turn,
      });
    }
    game.data.discardPile = Card.encode(card) + discardPile;
    // Remove that card from the hand
    let newCards = hand.cards.split('');
    newCards.splice(
      action.data.index * Card.ENCODING_LENGTH,
      Card.ENCODING_LENGTH
    );
    hand.cards = newCards.join('');
    await GameFlow.endTurn(game);
    return game;
  }
  return false;
}

function getNextPlayer(game) {
  var nextPlayer = game.turn;
  if (game.data.direction === 'standard') {
    nextPlayer += 1;
    if (nextPlayer === game.players.length) nextPlayer = 0;
  } else {
    nextPlayer -= 1;
    if (nextPlayer === -1) nextPlayer = game.players.length - 1;
  }
  return nextPlayer;
}

function shuffle(cards) {
  var newCards = [];
  while (cards.length > 0) {
    let randomInteger = Math.floor(Math.random() * cards.length);
    newCards.push(cards[randomInteger]);
    cards.splice(randomInteger, 1);
  }
  return newCards;
}

function dealCards(game) {
  for (let i = 0; i < game.players.length; i++) {
    let hand = [];
    // Deal 7 cards to each player
    for (let j = 0; j < STARTING_HAND_SIZE; j++) {
      let card = drawTopCard(game);
      hand.push(card);
    }
    game.data.hands[i].cards = Card.encodeArray(hand);
  }
}

function drawTopCard(game) {
  let card = Card.getTopCard(game.data.drawPile);
  game.data.drawPile = game.data.drawPile.substring(
    Card.ENCODING_LENGTH,
    game.data.drawPile.length
  );
  return card;
}

export default {
  place,
  shuffle,
  getNextPlayer,
  dealCards,
  Card,
  drawTopCard,
};
