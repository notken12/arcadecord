const Common = require('./common');

// Import Game class
const Game = require('../../Game');

// Import GameFlow to control game flow
const GameFlow = require('../../GameFlow');

// fetch used to get data from the yesno.wtf API
const fetch = require('node-fetch');

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

  this.on('init', Game.eventHandlersDiscord.init.bind(this)); // <-- don't forget .bind(this)
  this.on('turn', Game.eventHandlersDiscord.turn.bind(this));
  this.on('end', () => {
      this.channel.send('Game ended player ' + this.winner + ' won!');
  });

  this.setActionModel("endTurn", Common.endTurn)
}
}


module.exports = {
  options,
  Game:Chess
}
