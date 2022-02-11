// Import common module for this game type
import Common from './common.js';

// Import Game class
import Game from '../../Game.js';

// Game options, required. Export as options
// README.md
const options = {
    typeId: 'cuppong',
    name: 'Cup Pong',
    description: 'Play a game of Cup Pong with a friend',
    aliases: ['beerpong', 'pong', 'cup'],
    minPlayers: 2,
    maxPlayers: 2,
    emoji: '🥤',
    data: {
        
    }
}

// Game constructor, extends base Game class
// Don't forget to super(options);
class CupPongGame extends Game {
    constructor (config) {
        // Creates a game with the options
        // Required
        super(options, config); // Config is the options given by the user, and other things like the channel and guild        

        this.on('init', (game) => {
            game.data = {
                sides: [
                    {
                        color: 'red',
                        cups: []
                    },
                    {
                        color: 'blue',
                        cups: []
                    }
                ]
            }

            game.data.sides.forEach(side => {
                for (let i = 0; i < 10; i++) {
                    let id = `${side.color}${i}`;
                    side.cups.push(new Common.Cup(id, side.color, i));
                }
            })
        })

        this.on('init', Game.eventHandlersDiscord.init);
        this.on('turn', Game.eventHandlersDiscord.turn);
    }
}

export default {
    options,
    Game: CupPongGame,
}