const Game = require("../../Game");
const GameFlow = require("../../GameFlow");

const Common = require("./common");

class HitBoard {
    constructor(playerIndex, width, height) {
        this.playerIndex = playerIndex;
        this.width = width;
        this.height = height;

        var i = playerIndex;

        var h = Common.SHIP_DIRECTION_HORIZONTAL;
        var v = Common.SHIP_DIRECTION_VERTICAL;

        this.revealedShips = [];

        this.cells = [];
        for (var row = 0; row < height; row++) {
            this.cells[row] = [];
            for (var col = 0; col < height; col++) {
                this.cells[row][col] = {
                    state: Common.BOARD_STATE_EMPTY,
                    x: col,
                    y: row,
                    id: col + "-" + row,
                };
            }
        }

    }
}

class Ship {
    constructor(id, playerIndex, length, direction, type, x, y) {
        this.id = id;
        this.playerIndex = playerIndex;
        this.x = x || 0;
        this.y = y || 0;
        this.length = length || 2;
        this.type = type || 0;
        this.direction = direction || Common.SHIP_DIRECTION_HORIZONTAL;
    }
}



// use Game options schema

const options = {
    name: 'Sea Battle',
    description: 'Strike down your opponent\'s hidden ships!',
    aliases: ['battleship'],
    typeId: 'seabattle',
    maxPlayers: 2,
    minPlayers: 2,
    data: {
        hitBoards: [ // the map of hits and misses
            new HitBoard(0, 10, 10),
            new HitBoard(1, 10, 10)
        ],
        availableShips: [],
        placed: [false, false]
    },
    secretData: {
        boards: [ // the map of ships
            new Common.ShipPlacementBoard(10, 10),
            new Common.ShipPlacementBoard(10, 10)
        ]
    },
    emoji: '🚢'
};

class SeaBattleGame extends Game {
    constructor(config) {
        super(options, config);


        // add ships
        for (var i = 0; i < this.maxPlayers; i++) {
            var ships = [];
            for (var j = 0; j < Common.SHIP_TYPES.length; j++) {
                for (var k = 0; k < Common.SHIP_QUANTITIES[j]; k++) {
                    ships.push(new Ship(j + '_' + k, i, Common.SHIP_LENGTHS[j], undefined, Common.SHIP_TYPES[j]));
                }
            }
            this.data.availableShips.push(ships);
        }

        var boards = this.secretData.boards;

        this.on('init', Game.eventHandlersDiscord.init.bind(this));

        this.on('turn', Game.eventHandlersDiscord.turn.bind(this));

        this.setActionModel('set_ships', Common.setShips);

        this.setActionModel('set_ships', (game, action) => {
            var board = action.data.shipPlacementBoard;
            var ships = action.data.ships;
            var playerIndex = action.playerIndex;

            if (game.data.placed[playerIndex]) {
                return false;
            }

            if (Common.isBoardValid(board)) {
                boards[playerIndex] = board;
                game.data.placed[playerIndex] = true;
                GameFlow.endTurn(game);
                return game;
            }
            return false;
        }, 'server');

        this.setActionModel('shoot', Common.shoot);

        this.setActionModel('shoot', (game, action) => {
            var board = boards[(action.playerIndex + 1) % game.players.length]; // the other player's board
            var hitBoard = game.data.hitBoards[action.playerIndex];


            if (!game.data.placed[action.playerIndex] || !board) {
                return false;
            }

            var x = action.data.x;
            var y = action.data.y;


            // get ship at x, y
            var ship = Common.getShipAt(board, x, y);
            if (!ship) {
                hitBoard.cells[y][x].state = Common.BOARD_STATE_MISS;

                // missed, end turn
                GameFlow.endTurn(game);

                return game;
            }

            // hit, give another chance
            hitBoard.cells[y][x].state = Common.BOARD_STATE_HIT;

            // check if ship is sunk
            var sunk = true;
            for (var i = 0; i < ship.length; i++) {
                var shipX = ship.x + i * (ship.direction == Common.SHIP_DIRECTION_HORIZONTAL ? 1 : 0);
                var shipY = ship.y + i * (ship.direction == Common.SHIP_DIRECTION_VERTICAL ? 1 : 0);
                if (hitBoard.cells[shipY][shipX].state !== Common.BOARD_STATE_HIT) {
                    sunk = false;
                    break;
                }


            }
            if (sunk) {
                ship.sunk = true;
                console.log(board);
                hitBoard.revealedShips.push(ship);
            }

            // check if all ships are sunk
            var allSunk = true;
            for (var ship of board.ships) {
                console.log(ship.sunk);
                console.log(ship);
                if (!ship.sunk) {
                    allSunk = false;
                    break;
                }
            }
            if (allSunk) {
                GameFlow.end(
                    game,
                    {
                        winner: action.playerIndex
                    }
                );
            }

            return game;

        }, 'server');
    }

    getThumbnail() {

    }
}

module.exports = {
    options: options,
    Game: SeaBattleGame
};