// Import common module for this game type
import Common from './common.js';

// Import Game class
import Game from '../../Game.js';

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';

// BotApi to tell the bot to send messages
import BotApi from '../../../bot/api.js';

// Game options, required. Export as options
// README.md
const options = {
    typeId: 'filler',
    name: 'Filler',
    description: 'Switch the color of squares to dominate the board.',
    aliases: ['switch', 'squaregame'],
    minPlayers: 2,
    maxPlayers: 2,
    emoji: '🟧',
    data: {
        
    }
}

// Game constructor, extends base Game class
// Don't forget to super(options);
class FillerGame extends Game {
    constructor (config) {
        // Creates a game with the options
        // Required
        super(options, config); // Config is the options given by the user, and other things like the channel and guild

        this.on('init', Game.eventHandlersDiscord.init);
        this.on('turn', Game.eventHandlersDiscord.turn);

        /*this.on('init', function (game) {
            game.data = {
                board: new Common.Board(16, 9)
            };
        });*/
    }
}

export default {
    options,
    Game: FillerGame,
}