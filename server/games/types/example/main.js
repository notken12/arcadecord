// Import common module for this game type
const Common = require('./common');

// Import Game class
const Game = require('../../Game');

// Import GameFlow to control game flow
const GameFlow = require('../../GameFlow');

// BotApi to tell the bot to send messages
const BotApi = require('../../../bot/api');

// fetch used to get data from the yesno.wtf API
const fetch = require('node-fetch');

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
        answers: [null, null]
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

        this.setActionModel('boop', Common.boop);
        this.setActionModel('end_turn', Common.endTurn);

        // "ask" action:
        // Get a random answer for a yes-or-no question
        // Needs to be done on the server to ensure sync

        // Common action model, checks if question has a question mark
        this.setActionModel('ask', Common.ask);

        // Server action model is processed after common action model succeeds
        this.setActionModel('ask', async (game, action) => {
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

module.exports = {
    options,
    Game: ExampleGame
}