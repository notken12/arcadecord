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
                        cups: [],
                        throwCount: 0,
                        throwsMade: 0,
                        lastKnocked: "",
                        inRedemption: false
                    },
                    {
                        color: 'blue',
                        cups: [],
                        throwCount: 0,
                        throwsMade: 0,
                        lastKnocked: "",
                        inRedemption: false
                    }
                ],
            }

            //       rowPos 0
            // rowNum 3:    c
            // rowNum 2:   c c
            // rowNum 1:  c c c
            // rowNum 0: c c c c
            //       rowPos 0

            game.data.sides.forEach(side => {
                for (let rowNum = 0; rowNum < 4; rowNum++) {
                    // Row 0 is the back row
                    let cupCount = 4 - rowNum;
                    let oddRow = rowNum % 2 === 1;
                    // rowPos 0 is the center of the row

                    let offset = oddRow ? 0 : 0.5;
                    for (let rowPos = -cupCount / 2 + offset; rowPos < cupCount / 2 - offset; rowPos++) {
                        let cup = new Common.Cup(side.color, rowNum, rowPos);
                        side.cups.push(cup);
                    }
                }
            })
        })

        this.on('init', Game.eventHandlersDiscord.init);
        this.on('turn', Game.eventHandlersDiscord.turn);

        this.setActionModel('throw', Common.action_throw)
        this.setActionSchema('throw', {
            type: 'object',
            properties: {
                force: { // Use for replaying action, not important to the server
                    type: 'object',
                    properties: {
                        x: {
                            type: 'number',
                            required: true
                        },
                        y: {
                            type: 'number',
                            required: true
                        },
                        z: {
                            type: 'number',
                            required: true
                        },
                    },
                    required: ['x', 'y', 'z']
                },
                knockedCup: {
                    type: 'string',
                    required: false
                },
                required: ['force']
            }
        })
    }
}

export default {
    options,
    Game: CupPongGame,
}