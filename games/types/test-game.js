//create game for test

const Game = require('../Game');

const options = {
    name: 'Test game',
    description: 'Click a button to increase score wow',
    maxPlayers: 2,
    minPlayers: 2,
    aliases: ['test'],
    id: 'test'
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
    }
}

module.exports = {
    options, Game: TestGame
}
