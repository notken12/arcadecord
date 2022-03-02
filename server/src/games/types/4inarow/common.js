// Snippet to import GameFlow for the server/client
import GameFlow from '../../GameFlow.js';

const emptyCell = null;

class Piece {
  color //Number, 0-Yellow, 1-Red
  row
  column
  constructor(color, row, column){
    this.color = color;
    this.row = row;
    this.column = column;
  }
}
class Board {
  width
  height
  constructor(width, height){
    this.width = width;
    this.height = height;
    this.pieces = []
  }
}

async function place(game, action){
  let col = action.data.col;
  var row = findLowestInColumn(game, col)
  if(row === undefined){ return false}
  game.data.board.pieces.push(new Piece(game.turn, row, col))

  let gameOver = checkGameOver(game, row, col)
  if(gameOver){
    await GameFlow.end(game, {
      winner:gameOver
    })
  } else {
    await GameFlow.endTurn(game)
  }
  return game;
}
function findLowestInColumn(game, col){
  let oldBoard = boardTo2D(game)
  let reversed = reversedRows(game)

  var i;
  var i;
  for(i=0;i<game.data.board.height;i++){
    if(oldBoard[reversed[i]][col] === emptyCell){
      return i
    }
  }
}

function checkGameOver(game, row, col){
  let oldBoard = boardTo2D(game);

  let check = [checkHorizontal(oldBoard, row, col), checkVertical(oldBoard, row, col), checkDiagonal(oldBoard, row, col)]

  if(check[0]) return check[0];
  if(check[1]) return check[1];
  if(check[2]) return check[2];
  if(isBoardFull(game.data.board)) return -1;
}
function isBoardFull(board){
  if(board.pieces.length >= board.width * board.height){
    return true;
  }
  return false;
}
function boardTo2D(game){
  let board = game.data.board;
  let reversed = reversedRows(game)
  let newArray = []

  var i;
  var j;
  for(i=0;i<board.height;i++){//This loop populates the empty array as a 2d array.
    newArray[i] = []
    for(j=0;j<board.width;j++){
      newArray[i][j] = emptyCell;
    }
  }

  for(i=0;i<board.pieces.length;i++){
    newArray[reversed[board.pieces[i].row]][board.pieces[i].column] = board.pieces[i].color
  }

  return newArray;
}
function reversedRows(game){
  let board = game.data.board;
  var arr = []
  var i;
  for(i=0;i<board.height;i++){
    arr[i] = i;
  }
  arr.reverse()
  return arr
}
function checkHorizontal(board, row, col){

}
function checkDiagonal(board, row, col){

}
function checkVertical(board, row, col){
  let pieceToLookFor = board[row][col]
  let up = 0;
  let down = 0;
  var i;
  for(i=1;i<board.length;i++){//up
    if(board[row-1]){
      if(board[row-1][col] === pieceToLookFor){
        up += 1;
      } else {
        break;
      }
    }
  }
  for(i=1;i<board.length;i++){//down
    if(board[row+1]){
      if(board[row+1][col] === pieceToLookFor){
        up += 1;
      } else {
        break;
      }
    }
  }

  if(up + down === 3){
    return pieceToLookFor;
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
  checkGameOver
}

export default exports;
