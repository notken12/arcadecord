const Game = require("../../Game");
const GameFlow = require("../../GameFlow");

const Common = require("./common");

const options = {
    typeId: "4inarow",
    name: "Four in a Row",
    description: "Get 4 in a row to win!",
    aliases: ['connect4', '4inarow'],
    minPlayers: 2,
    maxPlayers: 2,
    data: {
        board: new Common.Board(7, 6),
    }
};

class FourInARowGame extends Game {
    constructor(config) {
        super(options, config);

        this.on("init", Game.eventHandlersDiscord.init);
        this.on("turn", Game.eventHandlersDiscord.turn);

        this.setActionModel('place', Common.place);
    }
}