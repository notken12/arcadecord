import * as Client from '/public/js/client-framework.js';

import '/gamecommons/seabattle';


function getMyHitBoard(game) {
    var index = game.myIndex;
    if (index == -1) {
        if (game.isItUsersTurn(undefined, index)) {
            // game hasn't started yet but i can start the game by placing ships
            index = game.turn;
        }
    }

    var myHitBoard = game.data.hitBoards[index];

    return myHitBoard;
}


function ShipPlacementBoard(width, height) {
    var that = this;

    this.width = width;
    this.height = height;
    this.cells = [];
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
}

function GetValidPositions(board, ship, direction) {
    let maxX = direction == Common.SHIP_DIRECTION_HORIZONTAL ? board.width - ship.length : board.width - 1;
    let maxY = direction == Common.SHIP_DIRECTION_VERTICAL ? board.height - ship.length : board.height - 1;

    // search every tile in the board for a valid position
    // ships cannot be touching each other

    let validPositions = [];
    for (let i = 0; i < (maxX + 1) * (maxY + 1); i++) {
        // get x and y from index
        let x = i % (maxX + 1);
        let y = Math.floor(i / (maxX + 1));

        // create a bounding box for the ship that extends 1 tile out
        let x1 = x - 1;
        let y1 = y - 1;
        let x2 = x + ship.length;
        let y2 = y + 1;

        if (direction == Common.SHIP_DIRECTION_VERTICAL) {
            x2 = x + 1;
            y2 = y + ship.length;
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

            if (shipJ.direction == Common.SHIP_DIRECTION_VERTICAL) {
                x2j = shipJ.x + 0;
                y2j = shipJ.y + shipJ.length - 1;
            }

            // check if bounding boxes intersect with AABB
            if (x1 <= x2j && x2 >= x1j && y1 <= y2j && y2 >= y1j) {
                valid = false;
                break;
            }
        }

        if (valid) {
            validPositions.push({ x, y, direction });
        }
    }

    return validPositions;
}

function GetRandomShipPosition(board, ship) {
    let validPositionsHorizontal = GetValidPositions(board, ship, Common.SHIP_DIRECTION_HORIZONTAL);
    let validPositionsVertical = GetValidPositions(board, ship, Common.SHIP_DIRECTION_VERTICAL);

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


function connectionCallback(response) {
    var game = response.game;
    window.game = game;


    if (game.isItMyTurn()) {
        var myHitBoard = getMyHitBoard(game);

        var board = new ShipPlacementBoard(myHitBoard.width, myHitBoard.height);
        var ships = PlaceShips(myHitBoard.availableShips, board);
        console.log(ships);


        const ShipPlacer = {
            data() {
                return {
                    ships: ships.ships,
                    game: game
                }
            },
            computed: {
                styles() {
                    return {
                        width: myHitBoard.width * Common.CELL_SIZE + 'px',
                        height: myHitBoard.height * Common.CELL_SIZE + 'px'
                    }
                }
            }
        }

        var shipPlacer = Vue.createApp(ShipPlacer);

        const PlacedShip = {
            props: ['ship', 'game'],
            template: `
            <div class="placed-ship">
                <div class="placed-ship-image" :style="styles"></div>
                <div class="placed-ship-bounding-box" :style="boundingBoxStyles"></div>
            </div>`,
            computed: {
                styles() {
                    var ship = this.ship;
                    var x = ship.x * Common.CELL_SIZE;
                    var y = ship.y * Common.CELL_SIZE;
                    var width = ship.length * Common.CELL_SIZE;
                    var height = Common.CELL_SIZE;
                    if (ship.direction == Common.SHIP_DIRECTION_VERTICAL) {
                        height = ship.length * Common.CELL_SIZE;
                        width = Common.CELL_SIZE;
                    }
                    return {
                        left: x + 'px',
                        top: y + 'px',
                        width: width + 'px',
                        height: height + 'px'
                    }
                },
                boundingBoxStyles() {
                    // var ship = this.ship;
                    // var x = ship.boundingBox.x1 * Common.CELL_SIZE;
                    // var y = ship.boundingBox.y1 * Common.CELL_SIZE;
                    // var width = (ship.boundingBox.x2 - ship.boundingBox.x1 + 1) * Common.CELL_SIZE;
                    // var height = (ship.boundingBox.y2 - ship.boundingBox.y1 + 1) * Common.CELL_SIZE;
                    // return {
                    //     left: x + 'px',
                    //     top: y + 'px',
                    //     width: width + 'px',
                    //     height: height + 'px'
                    // }
                }
            }
        };

        shipPlacer.component('placed-ship', PlacedShip);


        shipPlacer.mount('#ship-placer');

    }



}

var gameId = window.location.pathname.split('/')[2];

Client.connect(gameId, connectionCallback);
