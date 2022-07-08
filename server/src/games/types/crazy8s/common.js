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

class Card {
    value;
    color;
    constructor(value, color){
        this.value = value;
        this.color = color;
    }
}

async function place(game, action){
    var card = game.data.playerHands[game.turn][action.data.index];
    var deck = game.data.deck;
    var pile = game.data.cardPile;

    if(pile[pile.length-1].color == card.color || pile[pile.length-1].value == card.value || pile[pile.length-1].color == 4){//Same color || same number || wild card
        if(card.value == 'reverse') game.data.direction = ["reverse", "standard"][["standard", "reverse"].indexOf(game.data.direction)];//Gets the opposite of the current direction
        var nextPlayer = getNextPlayer(game);
        if(card.value == '+2'){
            game.data.playerHands[nextPlayer].push(deck[deck.length-1], deck[deck.length-2]);
        }
        if(card.value == 'wild'){
            card.color = card.wildColor;//Color selection takes place in one turn client side
        }
        if(card.value == 'wild4'){
            game.data.playerHands[nextPlayer].push(deck[deck.length-1], deck[deck.length-2], deck[deck.length-3], deck[deck.length-4]);
            card.color = card.wildColor;
        }
        if(game.data.playerHands[game.turn].length == 0){
            await GameFlow.end(game, {
                winner:game.turn,
            })
        }
        pile.push(card);
        game.data.playerHands.splice(action.data.index, 1);
        await GameFlow.endTurn(game);
        return game;
    }
    return false;
}

function getNextPlayer(game){
    var nextPlayer = game.turn;
    if(game.data.direction === 'standard'){
        nextPlayer += 1;
        if(nextPlayer === game.players.length) nextPlayer = 0;
    } else {
        nextPlayer -= 1;
        if(nextPlayer === -1) nextPlayer = game.players.length-1;
    }
    return nextPlayer;
}

function shuffle(cards){
    var newCards = [];
    while(cards.length>0){
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
}