//create game for test

const Game = require('../Game');

const options = {
    name: 'Test game',
    description: 'Click a button to increase score wow',
    maxPlayers: 2,
    minPlayers: 2,
    aliases: ['test'],
    typeId: 'test',
    data: {
        scores: [0, 0],
    }
};

class TestGame extends Game {
    constructor() {
        super(options);
        this.winner = null;

        this.on('init', () => {
            this.channel.send('Test game initialized');
        });
        this.on('start', () => {
            this.channel.send('Test game started');
        });
        this.on('join', (player) => {
            this.channel.send(`${player.discordUser.username}#${player.discordUser.discriminator} joined the game ${this.id}`);
        });
        this.on('end', (result) => {
            if (result.winner) {
                var winner = this.players[result.winner];
                this.channel.send(`Test game ended, and <@${winner.discordUser.id}> won!`);
            } else {
                this.channel.send('Test game ended, and nobody won! (This should not be possible)');
            }
        });

        this.setActionModel('increase_score', async (action, game) => {

            game.data.scores[action.playerIndex]++;
            game.client.emit('score_increased', game.data.scores[action.playerIndex]);

            if (game.data.scores[action.playerIndex] >= 10) {
                game.end({
                    winner: action.playerIndex
                });
            }

            return game;

            // don't do this anywhere because of rate limits, can get blocked from api for spam
            //this.channel.send(`${player.discordUser.username}#${player.discordUser.discriminator} increased score to ${this.data.scores[action.playerIndex]}`);
        });

        this.setActionModel('end_turn', async (action, game) => {

            game.endTurn();
            game.client.emit('turn_ended');

            return game;
        });

        this.onAction('end_turn', (action) => {
            var player = this.players[action.playerIndex];
            if (this.data.scores[action.playerIndex] < 10) {
                var upNext = this.players[this.turn];
                this.channel.send(`${player.discordUser.username}#${player.discordUser.discriminator} ended their turn with score ${this.data.scores[action.playerIndex]}`);
                this.channel.send(`<@${upNext.discordUser.id}>, it's your turn!`);
            }
        });
    }



}

module.exports = {
    options,
    Game: TestGame
}