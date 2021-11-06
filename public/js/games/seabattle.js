import * as Client from '/public/js/client-framework.js';

import '/gamecommons/seabattle';

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

    var board = game.data.visibleBoards[game.myIndex];
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
}

var gameId = window.location.pathname.split('/')[2];

Client.connect(gameId, connectionCallback);