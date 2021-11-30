// Import common module for this game type
const Common = require('./common');

const Game = require('../../Game');

// Game options, required. Export as options
// README.md
const options = {
    typeId: 'example',
    name: 'Example game',
    description: 'Boop the mogo',
    aliases: ['mogo', 'boopthemogo'],
    minPlayers: 2,
    maxPlayers: 2,
    emoji: '🐶',
    data: {
        scores: [0, 0],
        answers: ['', '']
    }
}

// Game constructor, extends base Game class
// Don't forget to super(options);
class ExampleGame extends Game {
    constructor() {
        // Creates a game with the options
        // Required
        super(options);

        // Set up event listeners
        // Game.eventHandlersDiscord has default functions
        // for announcing events on Discord

        this.on('init', Game.eventHandlersDiscord.init.bind(this)); // <-- don't forget .bind(this)
        this.on('turn', Game.eventHandlersDiscord.turn.bind(this));
        
        // Assign event models

        // Common action models
        // Will be used on both client and server
        // * MUST use a function from Common *

        this.setActionModel('boop', Common.boop);
        this.setActionModel('end_turn', Common.endTurn);

        // ask_mogo action:
        // Get a random answer for a yes-or-no question
        // Needs to be done on the server to ensure sync
        // We will use an dummy common action model...
        // and use a server-only action model to generate the answer

        // Just returns the game to make the action succeed
        this.setActionModel('ask_mogo', Common.ask); 

        // Server action model is processed after common action model succeeds
        this.setActionModel('ask', (game, action) => {
            var answer = Math.round(Math.random()) ? 'Yes' : 'No';

            game.data.answers[action.playerIndex] = answer;

            return game;
        }, 'server'); // <-- important

        // The server will acknowledge the action...
        // and send the updated game if it was successful
    }
}

module.exports = {
    options,
    Game: ExampleGame
}