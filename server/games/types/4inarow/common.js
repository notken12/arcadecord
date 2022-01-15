// Snippet to import GameFlow for the server/client
var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");

var GameFlow;

// tests if global scope is bound to window
if (!isBrowser()) {
    let { default: g } = await import('../../GameFlow.js');
    GameFlow = g;
} else {
    GameFlow = window.GameFlow;
}

var exports = {
    CELL_STATE_EMPTY: null,
    Board: function (width, height) {
        this.width = width;
        this.height = height;

        // create the board
        // 2d array of cells
        this.cells = [];
        for (var row = 0; row < height; row++) {
            this.cells[row] = [];
            for (var col = 0; col < width; col++) {
                this.cells[row][col] = exports.CELL_STATE_EMPTY;
            }
        }
    },
    place (game, action) {
        var playerIndex = action.playerIndex;

        var board = game.data.board;

        var col = action.data.col;
        var cells = board.cells;

        var lowestRow = -1;

        // get lowest empty cell in column
        for (var row = board.height - 1; row <= 0; row--) {
            if (cells[row][col] === this.CELL_STATE_EMPTY) {
                lowestRow = row;
                break;
            }
        }

        // check if column is full
        if (lowestRow === -1) {
            // column is full
            return false;
        }

        // place the piece on the board
        cells[lowestRow][col] = playerIndex;

        // check if the player has won
        var hasWon = this.checkForWin(game, playerIndex, lowestRow, col);

        if (hasWon) {
            // end the game
            GameFlow.end(game, { winner: playerIndex });
        } else {
            // end the turn
            GameFlow.endTurn(game);
        }
    },
    checkForWin(game, playerIndex, row, col) {
        var board = game.data.board;
        var cells = board.cells;

        // check horizontal
        var hasWon = this.checkHorizontal(cells, playerIndex, row, col);
        if (hasWon) {
            return true;
        }

        // check vertical
        hasWon = this.checkVertical(cells, playerIndex, row, col);
        if (hasWon) {
            return true;
        }

        // check diagonal
        hasWon = this.checkDiagonal(cells, playerIndex, row, col);
        if (hasWon) {
            return true;
        }

        return false;
    },
    checkHorizontal(cells, playerIndex, row, col) {
        var count = 0;
        for (var i = 0; i < cells[row].length; i++) {
            if (cells[row][i] === playerIndex) {
                count++;
            } else {
                count = 0;
            }

            if (count >= 4) {
                return true;
            }
        }

        return false;
    },
    checkVertical(cells, playerIndex, row, col) {
        var count = 0;
        for (var row = 0; row < cells.length; row++) {
            if (cells[row][col] === playerIndex) {
                count++;
            } else {
                count = 0;
            }

            if (count >= 4) {
                return true;
            }
        }

        return false;
    },
    checkDiagonal(cells, playerIndex, row, col) {
        var count = 0;

        // check top left to bottom right
        for (var i = -3; i <= 3; i++) {
            var row = row + i;
            var col = col + i;
            
            if (row < 0 || col < 0 || row >= cells.length || col >= cells[row].length) {
                // out of bounds
                continue;
            }

            if (cells[row][col] === playerIndex) {
                count++;
            } else {
                count = 0;
            }

            if (count >= 4) {
                return true;
            }
        }

        // check top right to bottom left
        count = 0;
        for (var i = -3; i <= 3; i++) {
            var row = row + i;
            var col = col - i;
            
            if (row < 0 || col < 0 || row >= cells.length || col >= cells[row].length) {
                // out of bounds
                continue;
            }

            if (cells[row][col] === playerIndex) {
                count++;
            } else {
                count = 0;
            }

            if (count >= 4) {
                return true;
            }
        }

        return false;
    }
}

export default exports;