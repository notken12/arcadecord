const Game = require("../../Game");

const Common = require("./common");

class Board {
    constructor (playerIndex, width, height) {
        this.playerIndex = playerIndex;
        this.width = width;
        this.height = height;

        var i = playerIndex;

        var h = Common.SHIP_DIRECTION_HORIZONTAL;
        var v = Common.SHIP_DIRECTION_VERTICAL;

        this.availableShips = [];

        // add ships
        for (var j = 0; j < Common.SHIP_TYPES.length; j++) {
            for (var k = 0; k < Common.SHIP_QUANTITIES[j]; k++) {
                this.availableShips.push(new Ship(i, Common.SHIP_LENGTHS[j], undefined, Common.SHIP_TYPES[j]));
            }
        }

        this.ships = [];

        this.cells = [];
        for (var x = 0; x < width; x++) {
            this.cells[x] = [];
            for (var y = 0; y < height; y++) {
                this.cells[x][y] = Common.BOARD_STATE_EMPTY;
            }
        }

        this.shipsPlaced = false;
    }
}

class Ship {
    constructor (playerIndex, length, direction, type, x, y) {
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
            new Board(0, 10, 10),
            new Board(1, 10, 10)
        ],
    },
    emoji: '🚢'
};

class SeaBattleGame extends Game {
    constructor () {
        super(options);

        var boards = [
            new Board(0, 10, 10),
            new Board(1, 10, 10)
        ];
        
        this.on('init', Game.eventHandlersDiscord.init.bind(this));

        this.on('turn', Game.eventHandlersDiscord.turn.bind(this));

        this.setActionModel('place_ships', Common.placeShips);
        this.setActionModel('place_ships', (game, action) => {
            var ships = action.ships;
            var board = boards[action.playerIndex];
            for (var i = 0; i < 10; i++) {
                board.cells[i] = [];
                for (var j = 0; j < 10; j++) {
                    board.cells[i][j] = BOARD_STATE_EMPTY;
                }
            }
        
            if (!setShipsForBoard(board, ships)) {
                return false;
            }
        
            return game;
        }, 'server');

        this.setActionModel('shoot', Common.shoot);

        this.setActionModel('shoot', (game, action) => {
            var board = boards[action.playerIndex + 1 % game.players.length];
            var hitBoard = game.data.hitBoards[action.playerIndex];

            var result = {};
        
            if (!board.shipsPlaced) {
                return false;
            }
        
            var x = action.x;
            var y = action.y;
            
            if (board[x][y] == BOARD_STATE_SHIP) {
                hitBoard.cells[x][y] = BOARD_STATE_HIT;

                // get ship at x, y
                var ship = this.getShipAt(board, x, y);
                if (!ship) return false;

                // check if ship is sunk
                var sunk = true;
                for (var i = 0; i < ship.length; i++) {
                    var shipX = ship.x + i * (ship.direction == Common.SHIP_DIRECTION_HORIZONTAL ? 1 : 0);
                    var shipY = ship.y + i * (ship.direction == Common.SHIP_DIRECTION_VERTICAL ? 1 : 0);
                    if (board.cells[shipX][shipY] != BOARD_STATE_HIT) {
                        sunk = false;
                        break;
                    }

                    if (sunk) {
                        result.revealedShip = ship;
                    }
                }
            } else {
                hitBoard.cells[x][y] = BOARD_STATE_MISS;
            }

            result.x = x;
            result.y = y;
            result.state = hitBoard.cells[x][y];
        
            return [game, changes];
        }, 'server');
    }

    getShipAt(board, x, y) {
        for (var i = 0; i < board.ships.length; i++) {
            var ship = board.ships[i];
            for (var j = 0; j < ship.length; j++) {
                var shipX = ship.x + j * (ship.direction == Common.SHIP_DIRECTION_HORIZONTAL ? 1 : 0);
                var shipY = ship.y + j * (ship.direction == Common.SHIP_DIRECTION_VERTICAL ? 1 : 0);
                if (shipX == x && shipY == y) {
                    return ship;
                }
            }
        }
        return null;
    }

    getThumbnail() {

    }
}

module.exports = {
    options: options,
    Game: SeaBattleGame
};