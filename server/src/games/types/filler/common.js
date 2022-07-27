// common.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Common action models

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';

////////

var COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

class Board {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    // Create a 2d array of cells
    this.cells = [];
    for (var i = 0; i < height; i++) {
      // new row
      var row = [];
      this.cells.push(row);
      for (var x = 0; x < width; x++) {
        // pick a random color
        let aboveColor = Board.getColor(this, i - 1, x);
        let leftColor = Board.getColor(this, i, x - 1);

        // cannot be the same color as the one above or to the left
        let availableColors = [];
        for (let i = 0; i < COLORS.length; i++) {
          if (i !== aboveColor && i !== leftColor) {
            availableColors.push(i);
          }
        }

        let randomColorIndex =
          availableColors[Math.floor(Math.random() * availableColors.length)];

        var cell = {
          color: randomColorIndex,
          row: i,
          col: x,
        };
        // add the colored tile to the row
        row.push(cell);
      }
    }
  }
  static getCorner(board, playerIndex) {
    if (playerIndex === 0) {
      // player 1
      // bottom left
      return {
        row: board.height - 1,
        col: 0,
      };
    } else {
      // player 2
      // top right
      return {
        row: 0,
        col: board.width - 1,
      };
    }
  }
  static getPlayerColor(board, playerIndex) {
    // finds the players corner
    var corner = Board.getCorner(board, playerIndex);

    // outputs the color of said corner
    return Board.getColor(board, corner.row, corner.col);
  }
  static getColor(board, row, col) {
    if (row < 0 || col < 0) return null;
    if (row >= board.height || col >= board.width) return null;

    return board.cells[row][col].color;
  }
  static addToBlob(blob, row, col) {
    var coord = {
      row: row,
      col: col,
    };
    if (!this.blobIncludes(blob, row, col)) {
      blob.push(coord);
    }
  }
  static blobIncludes(blob, row, col) {
    return blob.find((coord) => coord.row === row && coord.col === col);
  }
  static searchBlob(board, searched, blob, row, col) {
    var color = Board.getColor(board, row, col);
    // Always add center coordinate
    Board.addToBlob(blob, row, col);

    // Check if tile above matches
    if (Board.checkMatch(board, searched, row - 1, col, color)) {
      Board.searchBlob(board, searched, blob, row - 1, col);
    }

    // Check if tile below
    if (Board.checkMatch(board, searched, row + 1, col, color)) {
      Board.searchBlob(board, searched, blob, row + 1, col);
    }

    //check to the left
    if (Board.checkMatch(board, searched, row, col - 1, color)) {
      Board.searchBlob(board, searched, blob, row, col - 1);
    }

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
  static isBoardOnlyTwoColors(board) {
    let color1 = board.cells[0][0].color;
    let color2 = null;
    for (let row = 0; row < board.height; row++) {
      for (let col = 0; col < board.width; col++) {
        let { color } = board.cells[row][col];
        if (color !== color1 && color !== color2) {
          if (color2 === null) {
            color2 = color;
          } else {
            return false;
          }
        }
      }
    }
    return true;
  }
  static checkMatch(board, searched, row, col, color) {
    if (searched.find((coord) => coord.row === row && coord.col === col))
      return false;
    searched.push({ row, col });
    return Board.getColor(board, row, col) == color;
  }
}

// An action model is a function...
// that takes in a Game and an Action (see Game.js and Action.js)
// and outputs the updated Game if it succeeds, and otherwise outputs false

async function action_switchColors(game, action) {
  var playerIndex = action.playerIndex;

  var targetColor = action.data.targetColor;
  var board = game.data.board;

  var opponentColor = Board.getPlayerColor(board, playerIndex === 0 ? 1 : 0);
  var playerColor = Board.getPlayerColor(board, playerIndex);

  if (playerColor === targetColor || opponentColor === targetColor) {
    return false;
  }

  var playerBlob = Board.getPlayerBlob(board, playerIndex);

  for (var pos of playerBlob) {
    board.cells[pos.row][pos.col].color = targetColor;
  }

  if (Board.isBoardOnlyTwoColors(board)) {
    var newBlob = Board.getPlayerBlob(board, playerIndex);
    var opponentBlob = Board.getPlayerBlob(board, playerIndex === 0 ? 1 : 0);
    // Game over
    // Whoever has the most tiles wins
    let winner;
    if (newBlob.length > opponentBlob.length) {
      // Player wins
      winner = playerIndex;
    } else if (newBlob.length < opponentBlob.length) {
      // Opponent wins
      winner = playerIndex ^ 1;
    } else {
      // Tie
      winner = -1;
    }
    await GameFlow.end(game, {
      winner: winner,
    });
    return game;
  }

  await GameFlow.endTurn(game);

  return game;
}

export default {
  COLORS: COLORS,
  Board: Board,
  action_switchColors: action_switchColors,
};
