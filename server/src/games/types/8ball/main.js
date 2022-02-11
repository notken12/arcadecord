// Import common module for this game type
import Common from './common.js';

// Import Game class
import Game from '../../Game.ts';

// Game options, required. Export as options
// README.md
const options = {
    typeId: '8ball',
    name: '8 Ball',
    description: 'Play classic 8 ball pool with your friends!',
    aliases: ['pool'],
    minPlayers: 2,
    maxPlayers: 2,
    emoji: '🎱',
    data: {
        
    }
}

// Game constructor, extends base Game class
// Don't forget to super(options);
class EightBallGame extends Game {
    constructor (config) {
        // Creates a game with the options
        // Required
        super(options, config); // Config is the options given by the user, and other things like the channel and guild
        

        this.on('init', Game.eventHandlersDiscord.init);
        this.on('turn', Game.eventHandlersDiscord.turn);

        this.on('init', function (game) {
            game.data = {
                test: 'mango'
            };
        });
    }
}

export default {
    options,
    Game: EightBallGame,
}