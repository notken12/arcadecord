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

  this.setActionModel("endTurn", Common.endTurn)
  this.setActionModel("movePiece", Common.movePiece)
}
}


export default {
  options,
  Game:Chess
}
