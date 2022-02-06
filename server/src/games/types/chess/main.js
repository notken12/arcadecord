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
    // Populate on init
  }
}

class Chess extends Game {
constructor(config){
  super(options, config);

  const frontRow = 'pppppppp'
  const backRow = 'rnbqkbnr'

  this.on('init', (game) => {
    game.data.previousMoves = [];
    game.data.board = [];
    let randomColor = Math.round(Math.random())
    game.data.colors = [randomColor, randomColor === 0 ? 1 : 0];

    for (let color = 0; color < 2; color++) {
      for (let file = 0; file < 8; file++) {
        let frontRowRank = color === 0 ? 1 : 6;
        let backRowRank = color === 0 ? 0 : 7;
        game.data.board.push(new Common.Piece(`${frontRow[file]}${color}:${file}-${frontRowRank}`, color, frontRow[file], file, frontRowRank));
        game.data.board.push(new Common.Piece(`${backRow[file]}${color}:${file}-${backRowRank}`, color, backRow[file], file, backRowRank));
      }
    }
    return game;
  })

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
