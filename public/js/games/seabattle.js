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

    this.WithoutShip = function (ship) {
        let newBoard = new ShipPlacementBoard(that.width, that.height);
        newBoard.ships = that.ships.filter(s => s.id != ship.id);
        return newBoard;
    }
}

function isValidPosition(board, ship, x, y, direction, distance) {
    // create a bounding box for the ship that extends 1 tile out
    if (distance === undefined)
        distance = 1;

    let x1 = x - distance;
    let y1 = y - distance;
    let x2 = x + ship.length + distance - 1;
    let y2 = y + distance;

    if (direction == Common.SHIP_DIRECTION_VERTICAL) {
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

    return valid;
}

function isBoardValid(board, distance) {
    for (let i = 0; i < board.ships.length; i++) {
        let ship = board.ships[i];

        let excludingShip = board.WithoutShip(ship);
        let valid = isValidPosition(excludingShip, ship, ship.x, ship.y, ship.direction, distance);
        if (!valid)
            return false;
    }
    return true;
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

        if (isValidPosition(board, ship, x, y, direction)) {
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


    if (!game.isItMyTurn()) {
        return
    }
    var mouseIsDown = false;
    var mouseLandingPoint = {};
    var dragTarget = null;
    var initialDragTargetPosition = null;
    var dragOffset = {};

    document.addEventListener('mouseup', function (e) {
        mouseIsDown = false;
        mouseLandingPoint = {};
    }, true);

    var shipPlacerEl = document.querySelector('.ship-placer-container');

    document.addEventListener('mousemove', function (e) {
        e.preventDefault();

        if (mouseIsDown && dragTarget != null) {
            var offsetX = e.clientX - mouseLandingPoint.x;
            var offsetY = e.clientY - mouseLandingPoint.y;

            var shipOffsetX = Math.floor(offsetX / Common.CELL_SIZE);
            var shipOffsetY = Math.floor(offsetY / Common.CELL_SIZE);

            var bb = shipPlacerEl.getBoundingClientRect();

            // get nearest tile
            var nearestX = Math.floor((e.clientX - bb.left) / Common.CELL_SIZE);
            var nearestY = Math.floor((e.clientY - bb.top) / Common.CELL_SIZE);

            var newX = initialDragTargetPosition.x + shipOffsetX;
            var newY = initialDragTargetPosition.y + shipOffsetY;

            console.log(nearestX, nearestY);

            dragTarget.move({ x: nearestX - dragOffset.x, y: nearestY - dragOffset.y });
        }
    }, true)

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
                    height: myHitBoard.height * Common.CELL_SIZE + 'px',
                    "background-size": Common.CELL_SIZE + 'px ' + Common.CELL_SIZE + 'px'
                }
            }
        }
    }

    var shipPlacer = Vue.createApp(ShipPlacer);

    const PlacedShip = {
        props: ['ship', 'game'],
        template: `
            <div class="placed-ship">
                <img :style="imgStyles" :src="imageURL" class="placed-ship-image" @mousedown="mousedown($event)"/>
                <div class="placed-ship-bounding-box"></div>
            </div>`,
        data() {
            var ship = this.ship;
            return {

            }
        },
        computed: {
            styles() {

            },
            imgStyles() {
                var ship = this.ship;

                var transform = '';
                if (ship.direction == Common.SHIP_DIRECTION_VERTICAL) {
                    transform = 'rotate(90deg)';
                }

                var x = ship.x * Common.CELL_SIZE;
                var y = ship.y * Common.CELL_SIZE;
                var width = ship.length * Common.CELL_SIZE;
                var height = Common.CELL_SIZE;

                return {
                    transform: transform,
                    transformOrigin: Common.CELL_SIZE / 2 + 'px',
                    left: x + 'px',
                    top: y + 'px',
                    width: width + 'px',
                    height: height + 'px'
                };
            },

            imageURL() {
                var ship = this.ship;
                var shipType = ship.type;
                return '/public/assets/seabattle/ships/' + shipType + '.png';
            },

        },
        methods: {
            move(pos) {
                var ship = this.ship;
                var board = _.cloneDeep(ships);
                board.ships.forEach(element => {
                    if (element.id == ship.id) {
                        element.x = pos.x;
                        element.y = pos.y;
                    }
                });

                if (isBoardValid(board, 0)) {
                    ship.x = pos.x;
                    ship.y = pos.y;
                }
            },
            mousedown(e) {
                var ship = this.ship;

                mouseIsDown = true;

                var elPos = e.target.getBoundingClientRect();


                var x = elPos.x + Common.CELL_SIZE / 2 + Math.floor((e.clientX - elPos.x) / Common.CELL_SIZE) * Common.CELL_SIZE;
                var y = elPos.y + Common.CELL_SIZE / 2;

                if (ship.direction == Common.SHIP_DIRECTION_VERTICAL) {
                    y = elPos.y + Common.CELL_SIZE / 2 + Math.floor((e.clientY - elPos.y) / Common.CELL_SIZE) * Common.CELL_SIZE;
                    x = elPos.x + Common.CELL_SIZE / 2;
                }



                var bb = shipPlacerEl.getBoundingClientRect();

                // get nearest tile
                var nearestX = Math.floor((e.clientX - bb.left) / Common.CELL_SIZE);
                var nearestY = Math.floor((e.clientY - bb.top) / Common.CELL_SIZE);

                var offsetX = nearestX - this.ship.x;
                var offsetY = nearestY - this.ship.y;
                dragOffset = { x: offsetX, y: offsetY };


                mouseLandingPoint = { x, y };
                dragTarget = this;
                initialDragTargetPosition = { x: this.ship.x + 0, y: this.ship.y + 0 };

            }
        }
    };

    shipPlacer.component('placed-ship', PlacedShip);


    shipPlacer.mount('#ship-placer');




}

var gameId = window.location.pathname.split('/')[2];

Client.connect(gameId, connectionCallback);
