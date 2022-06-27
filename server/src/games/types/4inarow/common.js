// common.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Snippet to import GameFlow for the server/client
import GameFlow from '../../GameFlow.js';

const emptyCell = null;

class Piece {
  color; //Number, 0-Yellow, 1-Red
  row;
  column;
  index;
  constructor(color, row, column, index) {
    this.color = color;
    this.row = row;
    this.column = column;
    this.index = index;
  }
}
class Board {
  width;
  height;
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pieces = [];
  }
}

async function place(game, action) {
  let reversed = reversedRows(game);
  let col = action.data.col;
  var row = findLowestInColumn(game, col);
  if (row === undefined) {
    return false;
  }
  game.data.board.pieces.push(
    new Piece(game.turn, row, col, game.data.board.pieces.length)
  );
  game.data.mostRecentPiece = game.data.board.pieces.length - 1;
  game.data.board.oldBoard = boardTo2D(game);

  if (checkGameOver(game, reversed[row], col)) {
    await GameFlow.end(game, {
      winner: game.turn,
    });
  } else {
    await GameFlow.endTurn(game);
  }
  return game;
}
function findLowestInColumn(game, col) {
  let oldBoard = boardTo2D(game);
  let reversed = reversedRows(game);

  var i;
  var i;
  for (i = 0; i < game.data.board.height; i++) {
    if (oldBoard[reversed[i]][col] === emptyCell) {
      return i;
    }
  }
}

function checkGameOver(game, row, col) {
  let oldBoard = boardTo2D(game);

  let check = [
    checkHorizontal(oldBoard, row, col),
    checkVertical(oldBoard, row, col),
    checkDiagonal(oldBoard, row, col),
  ];

  if (check[0] || check[1] || check[2]) return true;
  if (isBoardFull(game.data.board)) return -1;
}
function isBoardFull(board) {
  if (board.pieces.length >= board.width * board.height) {
    return true;
  }
  return false;
}
function boardTo2D(game) {
  let board = game.data.board;
  let reversed = reversedRows(game);
  let newArray = [];

  var i;
  var j;
  for (i = 0; i < board.height; i++) {
    //This loop populates the empty array as a 2d array.
    newArray[i] = [];
    for (j = 0; j < board.width; j++) {
      newArray[i][j] = emptyCell;
    }
  }

  for (i = 0; i < board.pieces.length; i++) {
    newArray[reversed[board.pieces[i].row]][board.pieces[i].column] =
      board.pieces[i].color;
  }

  return newArray;
}
function reversedRows(game) {
  let board = game.data.board;
  var arr = [];
  var i;
  for (i = 0; i < board.height; i++) {
    arr[i] = i;
  }
  arr.reverse();
  return arr;
}
function checkHorizontal(board, row, col) {
  let pieceToLookFor = board[row][col];
  let left = 0;
  let right = 0;
  var i;
  for (i = 1; i < board.length; i++) {
    //left
    if (board[row][col - i] === pieceToLookFor) {
      left += 1;
    } else {
      break;
    }
  }
  for (i = 1; i < board.length; i++) {
    //right
    if (board[row][col + i] === pieceToLookFor) {
      right += 1;
    } else {
      break;
    }
  }

  if (left + right >= 3) {
    return true;
  }
}
function checkDiagonal(board, row, col) {
  let pieceToLookFor = board[row][col];
  let ul = 0;
  let ur = 0;
  let dl = 0;
  let dr = 0;
  let upContinue = true;
  let downContinue = false;
  var i;
  for (i = 1; i < board.length; i++) {
    //up-left
    if (board[row - i]) {
      if (board[row - i][col - i] === pieceToLookFor) {
        ul += 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  for (i = 1; i < board.length; i++) {
    //up-right
    if (board[row - i]) {
      if (board[row - i][col + i] === pieceToLookFor) {
        ur += 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  for (i = 1; i < board.length; i++) {
    //down-left
    if (board[row + i]) {
      if (board[row + i][col - i] === pieceToLookFor) {
        dl += 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  for (i = 1; i < board.length; i++) {
    //down-right
    if (board[row + i]) {
      if (board[row + i][col + i] === pieceToLookFor) {
        dr += 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (ul + dr >= 3 || ur + dl >= 3) {
    return true;
  }
}

function checkVertical(board, row, col) {
  let pieceToLookFor = board[row][col];
  let up = 0;
  let down = 0;
  var i;
  for (i = 1; i < board.length; i++) {
    //up
    if (board[row - i]) {
      if (board[row - i][col] === pieceToLookFor) {
        up += 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  for (i = 1; i < board.length; i++) {
    //down
    if (board[row + i]) {
      if (board[row + i][col] === pieceToLookFor) {
        up += 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (up + down >= 3) {
    return true;
  }
}
var exports = {
  emptyCell,
  Piece,
  Board,
  place,
  findLowestInColumn,
  reversedRows,
  boardTo2D,
  isBoardFull,
  checkDiagonal,
  checkVertical,
  checkHorizontal,
  checkGameOver,
};

export default exports;
