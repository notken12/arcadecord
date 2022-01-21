// Common action models

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';


////////

var COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // Create a 2d array of cells
        this.cells = [];
        for (var i = 0; i < height; i++) {
            // new row
            var row = [];
            for (var x = 0; x < width; x++) {
                // pick a random color
                var randomIndex = Math.floor(Math.random() * COLORS.length);
                var cell = {
                    color: randomIndex,
                    id: `r${i}c${x}`
                };
                // add the colored tile to the row
                row.push(cell);
            }
            this.cells.push(row);
        }
    }
    static getCorner(board, playerIndex) {
        if (playerIndex === 0) {
            // player 1
            // bottom left
            return {
                row: board.height - 1,
                col: 0
            }
        } else {
            // player 2
            // top right
            return {
                row: 0,
                col: board.width - 1
            }
        }
    }
    static getPlayerColor(board, playerIndex) {
        // finds the players corner
        var corner = Board.getCorner(board, playerIndex);

        // outputs the color of said corner
        return Board.getColor(board, corner);

    }
    static getColor(board, row, col) {
        if (row < 0 || col < 0)
            return null;
        if (row >= board.height || col >= board.width)
            return null;

        return board.cells[row][col].color;
    }
    static addToBlob(blob, row, col) {
        var coord = {
            row: row,
            col: col
        };
        if (!this.blobIncludes(blob, row, col)) {
            blob.push(coord);
        }
    }
    static blobIncludes(blob, row, col) {
        return blob.find(coord => coord.row === row && coord.col === col);
    }
    static searchBlob(board, searched, blob, row, col) {
        var color = Board.getColor(board, row, col);
        // Always add center coordinate
        Board.addToBlob(blob, row, col);

        // Check if tile above matches
        if (Board.checkMatch(board, searched, row - 1, col, color)) {
            Board.searchBlob(board, searched, blob, row - 1, col);
        };

        // Check if tile below
        if (Board.checkMatch(board, searched, row + 1, col, color)) {
            Board.searchBlob(board, searched, blob, row + 1, col);
        };

        //check to the left
        if (Board.checkMatch(board, searched, row, col - 1, color)) {
            Board.searchBlob(board, searched,  blob, row, col - 1);
        };

        //check to the right
        if (Board.checkMatch(board, searched, row, col + 1, color)) {
            Board.searchBlob(board, searched, blob, row, col + 1);
        }

        return blob;
    }
    static getPlayerBlob(board, playerIndex) {
        // 1. Get the player's color
        var corner = Board.getCorner(board, playerIndex);


        // 2. Get tiles in player's blob
        var blob = Board.searchBlob(board, [], [], corner.row, corner.col);

        // 3. Output blob (list of coords {row, col})
        return blob;
    }
    static checkMatch(board, searched, row, col, color) {
        if (searched.find(coord => coord.row === row && coord.col === col)) return false;
        searched.push({row, col});
        return Board.getColor(board, row, col) == color;
    }
}

// An action model is a function...
// that takes in a Game and an Action (see Game.js and Action.js)
// and outputs the updated Game if it succeeds, and otherwise outputs false

async function action_switchColors(game, action) {
    var playerIndex = action.playerIndex;

    var targetColor = action.data.targetColor;

    var board = game.data.board

    var playerBlob = Board.getPlayerBlob(board, playerIndex);

    for (var pos of playerBlob) {
        board.cells[pos.row][pos.col].color = targetColor
    }

    await GameFlow.endTurn(game);

    return game;
}

// Compatibility with browser and node

var exports = {
    COLORS: COLORS,
    Board: Board,
    action_switchColors: action_switchColors
}

/*if (typeof(module) !== 'undefined') {
    module.exports = exports; // require()
} else {
    window.Common = exports; // global var
}*/

export default exports;