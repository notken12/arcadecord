const SHIP_DIRECTION_HORIZONTAL = 0;
const SHIP_DIRECTION_VERTICAL = 1;
const SHIP_TYPES = ['Carrier', 'Battleship', 'Cruiser', 'Destroyer'];
const SHIP_LENGTHS = [4, 3, 2, 1];
const SHIP_QUANTITIES = [1, 2, 3, 4];

const BOARD_STATE_EMPTY = 0;
const BOARD_STATE_SHIP = 1;
const CELL_SIZE = 40;

function setShipsForBoard(board, ships) {
    for (var i = 0; i < ships.length; i++) {
        var ship = ships[i];
        var length = ship.length;
        var direction = ship.direction;
        var x = ship.x;
        var y = ship.y;
        if (direction == SHIP_DIRECTION_HORIZONTAL) {
            for (var j = 0; j < length; j++) {
                // check if overlapping
                if (board[x + j][y] != BOARD_STATE_EMPTY) {
                    return false;
                }
                board[x + j][y] = BOARD_STATE_SHIP;
            }
        } else if (direction == SHIP_DIRECTION_VERTICAL) {
            for (var j = 0; j < length; j++) {
                // check if overlapping
                if (board[x][y + j] != BOARD_STATE_EMPTY) {
                    return false;
                }
                board[x][y + j] = BOARD_STATE_SHIP;
            }
        } else {
            return false;
        }
    }
    
    board.shipsPlaced = true;
    return board;
}

function placeShips(game, action) {
    var ships = action.ships;
    var board = game.data.boards[action.playerIndex];
    
    if (!setShipsForBoard(board, ships)) {
        return false;
    }

    return game;
}

function shoot(game, action) {
    var playerIndex = action.playerIndex;
    var board = game.data.hitBoards[playerIndex];
    var x = action.x;
    var y = action.y;
    
    if (board[x][y] !== BOARD_STATE_EMPTY) {
        return false; // already shot
    }
    
    return game;

}

var exports = {
    SHIP_DIRECTION_HORIZONTAL,
    SHIP_DIRECTION_VERTICAL,
    SHIP_TYPES,
    SHIP_LENGTHS,
    SHIP_QUANTITIES,
    BOARD_STATE_EMPTY,
    BOARD_STATE_SHIP,
    CELL_SIZE,
    placeShips,
    shoot
};

if (typeof(module) !== 'undefined') {
    module.exports = exports;
} else {
    window.Common = exports;
}