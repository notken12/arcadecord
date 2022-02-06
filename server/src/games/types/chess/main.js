// Import common module for this game type
import Common from './common.js';

// Import Game class
import Game from '../../Game.js';

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';

const options = {
  typeId: 'chess',
  name: 'Chess',
  description: 'Play Chess With Friends!',
  aliases: ['cheese'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '♟️',
  data: {
    //color: 0-White, Black-1, file: 0-7 = a-h, rank: 0-7, type: p-Pawn, r-Rook, n-Knight, b-Bishop, q-Queen, k-King, id: can be anything unique
    "board":[
    {color:0, file:0, rank:0, type:"r", id:"piece1"},
    {color:0, file:1, rank:0, type:"n", id:"piece2"},
    {color:0, file:2, rank:0, type:"b", id:"piece3"},
    {color:0, file:3, rank:0, type:"q", id:"piece4"},
    {color:0, file:4, rank:0, type:"k", id:"piece5"},
    {color:0, file:5, rank:0, type:"b", id:"piece6"},
    {color:0, file:6, rank:0, type:"n", id:"piece7"},
    {color:0, file:7, rank:0, type:"r", id:"piece8"},
    {color:0, file:0, rank:1, type:"p", id:"piece9"},
    {color:0, file:1, rank:1, type:"p", id:"piece10"},
    {color:0, file:2, rank:1, type:"p", id:"piece11"},
    {color:0, file:3, rank:1, type:"p", id:"piece12"},
    {color:0, file:4, rank:1, type:"p", id:"piece13"},
    {color:0, file:5, rank:1, type:"p", id:"piece14"},
    {color:0, file:6, rank:1, type:"p", id:"piece15"},
    {color:0, file:7, rank:1, type:"p", id:"piece16"},
    {color:1, file:0, rank:7, type:"r", id:"piece17"},
    {color:1, file:1, rank:7, type:"n", id:"piece18"},
    {color:1, file:2, rank:7, type:"b", id:"piece19"},
    {color:1, file:3, rank:7, type:"q", id:"piece20"},
    {color:1, file:4, rank:7, type:"k", id:"piece21"},
    {color:1, file:5, rank:7, type:"b", id:"piece22"},
    {color:1, file:6, rank:7, type:"n", id:"piece23"},
    {color:1, file:7, rank:7, type:"r", id:"piece24"},
    {color:1, file:0, rank:6, type:"p", id:"piece25"},
    {color:1, file:1, rank:6, type:"p", id:"piece26"},
    {color:1, file:2, rank:6, type:"p", id:"piece27"},
    {color:1, file:3, rank:6, type:"p", id:"piece28"},
    {color:1, file:4, rank:6, type:"p", id:"piece29"},
    {color:1, file:5, rank:6, type:"p", id:"piece30"},
    {color:1, file:6, rank:6, type:"p", id:"piece31"},
    {color:1, file:7, rank:6, type:"p", id:"piece32"}
  ],
    "previousMoves":[]
  }
}

class Chess extends Game {
constructor(config){
  super(options, config);

  this.on('init', Game.eventHandlersDiscord.init);
  this.on('turn', Game.eventHandlersDiscord.turn);
  this.on('end', (game) => {
    var winner = game.players[game.winner];
    if (winner) {
        BotApi.sendMessage('Chess game ended and ' + winner.discordUser.username + ' won!', game.guild, game.channel);
    } else {
        BotApi.sendMessage('Chess game ended in a tie', game.guild, game.channel);
    }
  })

  this.setActionModel("endTurn", Common.endTurn)
  this.setActionModel("movePiece", Common.movePiece)
}
}


export default {
  options,
  Game:Chess
}
