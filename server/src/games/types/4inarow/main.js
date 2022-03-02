// Import common module for this game type
import Common from './common.js';

// Import Game class
import Game from '../../Game.js';

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';

const options = {
    typeId: "4inarow",
    name: "Four in a Row",
    description: "Get 4 in a row to win!",
    aliases: ['connect4', '4inarow'],
    minPlayers: 2,
    maxPlayers: 2,
    emoji:'🔵',
    data: {
        board: new Common.Board(7, 6),
    }
};

class FourInARowGame extends Game {
    constructor(config) {
        super(options, config);

        this.on("init", Game.eventHandlersDiscord.init);
        this.on("turn", Game.eventHandlersDiscord.turn);

        this.setActionModel('place', Common.place);
        this.setActionSchema('place', {
          type:"object",
          properties:{
            col:{
              type:"number",
              minimum:0,
              maximum:69
            }
          },
          required:["col"]
        })
    }
}

export default {
    options: options,
    Game: FourInARowGame
}
