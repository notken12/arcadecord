// Import common module for this game type
import Common from './common.js';

// Import Game class
import Game from '../../Game.js';

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';

// BotApi to tell the bot to send messages
import BotApi from '../../../../bot/api.js';

// fetch used to get data from the yesno.wtf API
import fetch from 'node-fetch';

// Game options, required. Export as options
// README.md
const options = {
    typeId: 'checkers',
    name: 'Checkers',
    description: 'Mongo',
    aliases: ['checkers', 'draughts'],
    minPlayers: 2,
    maxPlayers: 2,
    emoji: '🔴',
    data: {
        checkers: Array(8).fill(0).map((_, col) => (col % 2) ?
            Array(8).fill(0).map((_, row) => (row < 3) ? (row % 2) ? '' : 'b' : (row > 4) ? ((row + 1) % 2) ? 'r' : '' : '') :
            Array(8).fill(0).map((_, row) => (row < 3) ? ((row + 1) % 2) ? '' : 'b' : (row > 4) ? (row % 2) ? 'r' : '' : '')),
    }
}

// Game constructor, extends base Game class
// Don't forget to super(options);
class ExampleGame extends Game {
    constructor(config) {
        // Creates a game with the options
        // Required
        super(options, config); // Config is the options given by the user, and other things like the channel and guild

        // Set up event listeners
        // Game.eventHandlersDiscord has default functions
        // for announcing events on Discord

        this.on('init', Game.eventHandlersDiscord.init);
        this.on('turn', Game.eventHandlersDiscord.turn);
        this.on('end', (game) => {
            // tell bot to send the winner
            var winner = game.players[game.winner];
            if (winner) {
                BotApi.sendMessage('(Debug) Game ended and ' + winner.discordUser.username + ' won!', game.guild, game.channel);
            } else {
                BotApi.sendMessage('(Debug) Game ended and nobody won! (Shouldn\'t happen with example game)', game.guild, game.channel);
            }
        });

        // Assign event models

        // Common action models
        // Will be used on both client and server
        // * MUST use a function from Common *

        this.setActionModel('end_turn', Common.endTurn);

        // "ask" action:
        // Get a random answer for a yes-or-no question
        // Needs to be done on the server to ensure sync

        // Common action model, checks if question has a question mark
        this.setActionModel('ask', Common.ask);

        // Server action model is processed after common action model succeeds
        this.setActionModel('ask', async(game, action) => {
            // Get the answer from a yesno.wtf API
            var res = await fetch('https://yesno.wtf/api').catch(err => {
                console.error(err);
                return false;
            });

            var answer = await res.json();

            game.data.answers[action.playerIndex] = answer;
            return game;

        }, 'server'); // <-- important

        // The server will acknowledge the action...
        // and send the updated game if it was successful
    }
}

export default {
    options,
    Game: ExampleGame
}