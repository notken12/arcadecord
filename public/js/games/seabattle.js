import * as Client from '/public/js/client-framework.js';

import '/gamecommons/seabattle';

function placeShipsRandom(game) {
    var board = {
        width: game.data.hitBoards[game.myIndex].width,
        height: game.data.hitBoards[game.myIndex].height,
        cells: []
    };

    for (var i = 0; i < board.width; i ++) {
        board.cells[i] = [];
        for (var j = 0; j < board.height; j ++) {
            board.cells[i][j] = Common.BOARD_STATE_EMPTY;
        }
    }

    var ships = game.data.hitBoards[game.myIndex].availableShips;
    var placedShips = [];

    for (var i = 0; i < ships.length; i ++) {
        var ship = ships[i];
        var direction = Math.round(Math.random());
        var shipPlaced = false;
        while (!shipPlaced) {
            var x = Math.floor(Math.random() * board.width);
            var y = Math.floor(Math.random() * board.height);

            if (direction == 0) {
                if (x + ship.length > board.width) {
                    x = board.width - ship.length;
                }
            } else {
                if (y + ship.length > board.height) {
                    y = board.height - ship.length;
                }
            }
            shipPlaced = true;
            for (var j = 0; j < ship.length; j ++) {
                if (direction == 0) {
                    if (board.cells[x + j][y] !== Common.BOARD_STATE_EMPTY) {
                        shipPlaced = false;
                        break;
                    }
                } else {
                    if (board.cells[x][y + j] !== Common.BOARD_STATE_EMPTY) {
                        shipPlaced = false;
                        break;
                    }
                }
            }
        }
        for (var j = 0; j < ship.length; j ++) {
            if (direction == 0) {
                board.cells[x + j][y] = Common.BOARD_STATE_SHIP;
            } else {
                board.cells[x][y + j] = Common.BOARD_STATE_SHIP;
            }
        }

        placedShips.push({
            x: x,
            y: y,
            direction: direction,
            length: ship.length,
            type: ship.type
        });
    }
    
    return placedShips;
}


function connectionCallback(response) {
    var game = response.game;


    var stage = new Konva.Stage({
        container: 'game-canvas',
        width: window.innerWidth,
        height: window.innerHeight
    });

    // then create layer
    var boardLayer = new Konva.Layer();
    stage.add(boardLayer);

    var boardGroup = new Konva.Group();

    var board = game.data.hitBoards[game.myIndex];
    for (var i = 0; i < board.width; i ++) {
        for (var j = 0; j < board.height; j ++) {
            var cell = board.cells[i][j];
            
            var cellGroup = new Konva.Group({
                x: i * 32,
                y: j * 32,
            });
            boardGroup.add(cellGroup);

            if (cell == Common.BOARD_STATE_EMPTY) {
                var cellShape = new Konva.Circle({
                    x: 16,
                    y: 16,
                    radius: 4,
                    fill: '#000',
                    // stroke: '#000',
                    // strokeWidth: 1,
                });
                cellGroup.add(cellShape);
            }

            boardLayer.add(cellGroup);

        }
    }

    boardLayer.draw();

    window.game = game;
}

var gameId = window.location.pathname.split('/')[2];

Client.connect(gameId, connectionCallback);

window.placeShipsRandom = placeShipsRandom;