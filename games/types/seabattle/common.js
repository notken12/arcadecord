const SHIP_DIRECTION_HORIZONTAL = 0;
const SHIP_DIRECTION_VERTICAL = 1;
const SHIP_TYPES = ['Carrier', 'Battleship', 'Cruiser', 'Destroyer'];
const SHIP_LENGTHS = [4, 3, 2, 1];
const SHIP_QUANTITIES = [1, 2, 3, 4];

const BOARD_STATE_EMPTY = 0;
const BOARD_STATE_MISS = 1;
const BOARD_STATE_HIT = 2;
const CELL_SIZE = 40;

// function setShipsForBoard(board, ships) {
//     for (var i = 0; i < ships.length; i++) {
//         var ship = ships[i];
//         var length = ship.length;
//         var direction = ship.direction;
//         var x = ship.x;
//         var y = ship.y;
//         if (direction == SHIP_DIRECTION_HORIZONTAL) {
//             for (var j = 0; j < length; j++) {
//                 // check if overlapping
//                 if (board[x + j][y] != BOARD_STATE_EMPTY) {
//                     return false;
//                 }
//                 board[x + j][y] = BOARD_STATE_SHIP;
//             }
//         } else if (direction == SHIP_DIRECTION_VERTICAL) {
//             for (var j = 0; j < length; j++) {
//                 // check if overlapping
//                 if (board[x][y + j] != BOARD_STATE_EMPTY) {
//                     return false;
//                 }
//                 board[x][y + j] = BOARD_STATE_SHIP;
//             }
//         } else {
//             return false;
//         }
//     }
    
//     board.shipsPlaced = true;
//     return board;
// }

// function placeShips(game, action) {
//     var ships = action.ships;
//     var board = game.data.boards[action.playerIndex];
    
//     if (!setShipsForBoard(board, ships)) {
//         return false;
//     }

//     return game;
// }

function shoot(game, action) {
    var playerIndex = action.playerIndex;
    var board = game.data.hitBoards[playerIndex];
    var x = action.data.x;
    var y = action.data.y;
    
    if (board.cells[y][x].state !== BOARD_STATE_EMPTY) {
        return false; // already shot
    }
    
    return game;

}

function ShipPlacementBoard(width, height) {
    var that = this;

    this.width = width;
    this.height = height;
    this.ships = [];

    this.addShip = function (ship) {
        this.ships.push(ship);
    }

    this.WithShip = function (ship) {
        let newBoard = new ShipPlacementBoard(that.width, that.height);
        newBoard.ships = that.ships.slice();
        newBoard.ships.push(ship);
        return newBoard;
    }

    this.WithoutShip = function (ship) {
        let newBoard = new ShipPlacementBoard(that.width, that.height);
        newBoard.ships = that.ships.filter(s => s.id != ship.id);
        return newBoard;
    }
}

function isValidPosition(board, ship, x, y, direction, distance) {
    // create a bounding box for the ship that extends 1 tile out
    if (distance === undefined)
        distance = 0;

    let x1 = x - distance;
    let y1 = y - distance;
    let x2 = x + ship.length + distance - 1;
    let y2 = y + distance;

    if (direction == SHIP_DIRECTION_VERTICAL) {
        x2 = x + distance;
        y2 = y + ship.length + distance - 1;
        //console.log(x1, y1, x2, y2);
    }

    let valid = true;
    // ships cannot be touching each other
    // loop through ships
    for (let j = 0; j < board.ships.length; j++) {
        let shipJ = board.ships[j];

        // get bounding box for the ship
        let x1j = shipJ.x + 0;
        let y1j = shipJ.y + 0;
        let x2j = shipJ.x + shipJ.length - 1;
        let y2j = shipJ.y + 0;

        if (shipJ.direction == SHIP_DIRECTION_VERTICAL) {
            x2j = shipJ.x + 0;
            y2j = shipJ.y + shipJ.length - 1;
        }

        // check if bounding boxes intersect with AABB
        if (x1 <= x2j && x2 >= x1j && y1 <= y2j && y2 >= y1j) {
            valid = false;
            break;
        }
    }

    return valid;
}

function isBoardValid(b, distance) {
    var board = new ShipPlacementBoard(b.width, b.height);
    board.ships = b.ships;
    for (let i = 0; i < board.ships.length; i++) {
        let ship = board.ships[i];

        // check if ship is inside the board
        if (ship.direction == SHIP_DIRECTION_HORIZONTAL) {
            if (ship.x < 0 || ship.x + ship.length > board.width || ship.y < 0 || ship.y >= board.height)
                return false;
        } else {
            if (ship.x < 0 || ship.x >= board.width || ship.y < 0 || ship.y + ship.length > board.height)
                return false;
        }
        // check if ship is overlapping
        let excludingShip = board.WithoutShip(ship);

        let valid = isValidPosition(excludingShip, ship, ship.x, ship.y, ship.direction, distance);


        if (!valid)
            return false;
    }
    return true;
}


function GetValidPositions(board, ship, direction) {
    let maxX = direction == SHIP_DIRECTION_HORIZONTAL ? board.width - ship.length : board.width - 1;
    let maxY = direction == SHIP_DIRECTION_VERTICAL ? board.height - ship.length : board.height - 1;

    // search every tile in the board for a valid position
    // ships cannot be touching each other

    let validPositions = [];
    for (let i = 0; i < (maxX + 1) * (maxY + 1); i++) {
        // get x and y from index
        let x = i % (maxX + 1);
        let y = Math.floor(i / (maxX + 1));

        if (isValidPosition(board, ship, x, y, direction)) {
            validPositions.push({ x, y, direction });
        }
    }
    return validPositions;
}

function GetRandomShipPosition(board, ship) {
    let validPositionsHorizontal = GetValidPositions(board, ship, SHIP_DIRECTION_HORIZONTAL);
    let validPositionsVertical = GetValidPositions(board, ship, SHIP_DIRECTION_VERTICAL);

    let validPositions = validPositionsHorizontal.concat(validPositionsVertical);
    let position = validPositions[Math.floor(Math.random() * validPositions.length)];

    return position;
}


function PlaceShips(shipsRemaining, board) {
    let shipToPlace = shipsRemaining[0];

    // If all ships were placed, we are done.
    if (shipsRemaining.length == 0) {
        return board;
    }

    let attempts = 0;
    while (attempts++ < 100000) {
        // Get a position for the new ship that is OK with the current board.
        let pos = GetRandomShipPosition(board, shipToPlace);

        // If it isn't possible to find such a position, this branch is bad.
        if (pos == null)
            return null;

        shipToPlace.x = pos.x;
        shipToPlace.y = pos.y;
        shipToPlace.direction = pos.direction;

        // Create a new board, including the new ship.
        let newBoard = new board.WithShip(shipToPlace);

        // Recurse by placing remaining ships on the new board.
        let nextBoard = PlaceShips([...shipsRemaining].slice(1), newBoard);
        if (nextBoard != null)
            return nextBoard;
    }
    return null;
}

function setShips(game, action) {
    // nothing, just a placeholder
    // setting ships is done in the server and result is sent to the client
    return game;
}

var exports = {
    SHIP_DIRECTION_HORIZONTAL,
    SHIP_DIRECTION_VERTICAL,
    SHIP_TYPES,
    SHIP_LENGTHS,
    SHIP_QUANTITIES,
    BOARD_STATE_EMPTY,
    BOARD_STATE_HIT,
    BOARD_STATE_MISS,
    CELL_SIZE,
    // placeShips,
    shoot,
    ShipPlacementBoard,
    isBoardValid,
    isValidPosition,
    GetValidPositions,
    GetRandomShipPosition,
    PlaceShips,
    setShips
};

if (typeof(module) !== 'undefined') {
    module.exports = exports;
} else {
    window.Common = exports;
}