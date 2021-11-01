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
        this.on('end', () => {
            this.channel.send('Test game ended');
        });

        this.onAction('increase_score', (action) => {
            if (!this.isItUsersTurn(action.userId)) return;

            var player = this.players[action.playerIndex];
            this.data.scores[action.playerIndex]++;

            this.channel.send(`${player.discordUser.username}#${player.discordUser.discriminator} increased score to ${this.data.scores[action.playerIndex]}`);
        });

        this.onAction('end_turn', (action) => {
            if (!this.isItUsersTurn(action.userId)) return;
            this.endTurn();

            var player = this.players[action.playerIndex];

            var upNext = this.players[this.turn];

            this.channel.send(`${player.discordUser.username}#${player.discordUser.discriminator} ended their turn with score ${this.data.scores[action.playerIndex]}`);
            this.channel.send(`<@${upNext.discordUser.id}>, it's your turn!`);
        });
    }


    
}

module.exports = {
    options, Game: TestGame
}
