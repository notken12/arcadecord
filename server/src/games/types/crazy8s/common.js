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

/** @typedef {'r'|'g'|'b'|'y'|'2'|'4'|'w'|'s'|'R'} CardType */

class Card {
  /** Card's number, for non applicable cards use a unique number so each card is unique when encoded */
  number;
  /** Type of card (red, green, blue, yellow, +2, +4, wild, skip, or reverse).
   * Represent using r,g,b,y,2,4,w,s,R respectively.
   * @type CardType */
  type;
  /** @param {CardType} type */
  constructor(type, number) {
    this.type = type;
    this.number = number;
  }

  /** Encodes a card as 2 chars: {type}{number}
   * @param {Card} card */
  static encode(card) {
    return `${card.type}${card.number}`;
  }

  /** @param {Card[]} cards */
  static encodeArray(cards) {
    return cards.map((c) => Card.encode(c)).join('');
  }

  /** @param {string} str - String to decode from, see Card.encode */
  static decode(str) {
    return new Card(str[0], str[1]);
  }

  /** @param {string} str - String to decode from, see Card.encode */
  static decodeArray(str) {
    let arr = [];
    for (let i = 0; i < str.length; i += 2) {
      arr.push(Card.decode(str.substring(i, i + 1)));
    }
    return arr;
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
}

function random(seed) {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

async function place(game, action) {
  var card = game.data.playerHands[game.turn][action.data.index];
  var deck = game.data.deck;
  var pile = game.data.cardPile;

  if (
    pile[pile.length - 1].color == card.color ||
    pile[pile.length - 1].value == card.value ||
    pile[pile.length - 1].color == 4
  ) {
    //Same color || same number || wild card
    if (card.value == 'R')
      game.data.direction = ['reverse', 'standard'][
        ['standard', 'reverse'].indexOf(game.data.direction)
      ]; //Gets the opposite of the current direction
    var nextPlayer = getNextPlayer(game);
    if (card.value == '2') {
      game.data.playerHands[nextPlayer].push(
        deck[deck.length - 1],
        deck[deck.length - 2]
      );
    }
    if (card.value == 'w') {
      card.color = card.wildColor; //Color selection takes place in one turn client side
    }
    if (card.value == '4') {
      game.data.playerHands[nextPlayer].push(
        deck[deck.length - 1],
        deck[deck.length - 2],
        deck[deck.length - 3],
        deck[deck.length - 4]
      );
      card.color = card.wildColor;
    }
    if (game.data.playerHands[game.turn].length == 0) {
      await GameFlow.end(game, {
        winner: game.turn,
      });
    }
    pile.push(card);
    game.data.playerHands.splice(action.data.index, 1);
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
export default {
  place,
  shuffle,
  getNextPlayer,
  Card,
};
