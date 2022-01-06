// Import common module for this game type
const Common = require('./common');

// Import Game class
const Game = require('../../Game');

// Import GameFlow to control game flow
const GameFlow = require('../../GameFlow');

// BotApi to tell the bot to send messages
const BotApi = require('../../../bot/api');

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

        
    }
}