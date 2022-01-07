// Common action models

const { ShaderChunk } = require('three');

// Import GameFlow to control game flow
var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");

var GameFlow;

// tests if global scope is bound to window
if(!isBrowser()) {
    GameFlow = require('../../GameFlow.js');
} else {
    GameFlow = window.GameFlow;
}

////////

var COLORS = ['red','blue','green','yellow','purple','orange'];

class Board {
    constructor (width, height) {
        this.width = width;
        this.height = height;

        // Create a 2d array of cells
        this.cells = [];
        for (var i = 0; i < height; i++) {
            // new row
            var row = [];
            for (var x = 0; x < width; x) {
                // pick a random color
                var random = Math.floor(Math.random() * COLORS.length);
                // add the colored tile to the row
                row.push(random);
            }
            this.cells.push(row);
        }
    }
    getCorner(playerIndex) {
        if (playerIndex === 0) {
            // player 1
            // bottom left
            return {
                row: this.height - 1,
                col: 0
            }
        } else {
            // player 2
            // top right
            return {
                row: 0,
                col: this.width - 1
            }
        }
    }
    getPlayerColor(playerIndex) {
        // finds the players corner
        var corner = this.getCorner(playerIndex);

        // outputs the color of said corner
        return this.getColor(corner);
        
    }
    getColor(row, col) {
        if (row < 0 || col < 0)
            return null;
        if (row >= this.height || col >= this.width)
            return null;
        
        return this.cells[row][col];
    }
    addToBlob(blob, row, col) {
        var coord = {
            row: row,
            col: col
        };
        if (!blob.includes(coord)) {
            blob.push(coord);
        }
    }
    searchBlob(blob, row, col) {
        var color = this.getColor(row, col);
        // Always add center coordinate
        this.addToBlob(blob, row, col);

        // Check if tile above matches
        if (this.checkMatch(row-1, col, color)) {
            this.searchBlob(blob, row - 1, col);
        };

        // Check if tile below
        if (this.checkMatch(row+1, col, color)) { 
            this.searchBlob(blob, row + 1, col);
        };

        //check to the left
        if (this.checkMatch(row, col-1, color)) {
            this.searchBlob(blob, row, col - 1);
        };

        //check to the right
        if (this.checkMatch(row, col+1, color)) {
            this.searchBlob(blob, row, col + 1);
        }

        return blob;
    }
    getPlayerBlob(playerIndex) {
        // 1. Get the player's color
        var corner = this.getCorner(playerIndex);


        // 2. Get tiles in player's blob
        var blob = this.searchBlob([], corner.row, corner.col);

        // 3. Output blob (list of coords {row, col})
        return blob;
    }
    checkMatch(row, col, color) {
        return getColor(row, col) == color;
    }
}

// An action model is a function...
// that takes in a Game and an Action (see Game.js and Action.js)
// and outputs the updated Game if it succeeds, and otherwise outputs false

function switchColors(game, action) {
    var playerIndex = action.playerIndex;

    var targetColor = action.data.targetColor;


}