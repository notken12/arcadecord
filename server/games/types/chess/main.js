// Import common module for this game type
import Common from './common.js';

// Import Game class
import Game from '../../Game.js';

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';

// BotApi to tell the bot to send messages
import BotApi from '../../../bot/api.js';

const options = {
  typeId: 'chess',
  name: 'Chess',
  description: 'Play Chess With Friends!',
  aliases: ['cheese'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '♟️',
  data: {
    "board":[["r","n","b","q","k","b","n","r"],["p","p","p","p","p","p","p","p"],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],["P","P","P","P","P","P","P","P"],["R","N","B","Q","K","B","N","R"]],
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
