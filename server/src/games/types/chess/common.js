import GameFlow from '../../GameFlow.js';

var files = "abcdefgh";
var otherFiles = "hgfedcba"
var ranks = "87654321";

// var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");
// var GameFlow;

// // tests if global scope is bound to window
// if (!isBrowser()) {
//   let { default: g } = await import('../../GameFlow.js');
//   GameFlow = g;
// } else {
//   GameFlow = window.GameFlow;
// }

function isGameOver(board, player) {

  if (player == 1) {//White Pieces

  } else if (player == 0) {//Black Pieces

  }
}
async function movePiece(action /*from:[file, rank], to:[file, rank], castleSide: 0 for queen-side, 1 for king-side, promotion: piece type, double: if pawn moves 2 squares | this is for en passant*/, game) {
  let move = action.data.move;
  game = doMovePiece(game, move)
  game.data.previousMoves.push(action.data.move);
  return game;
}
async function doMovePiece(game, move){
  let piece = game.data.board.find(piece => piece.file === move.from[0] && piece.rank === move.from[1]);
  let capturedPiece = game.data.board.find(capturedPiece => capturedPiece.file === move.to[0] && capturedPiece.rank === move.to[1]);
  if(castleSide){
  let kingsRook = game.data.board.find(kingsRook => kingsRook.file === piece.file + 3 && kingsRook.rank === piece.rank);
  let queensRook = game.data.board.find(queensRook => queensRook.file === piece.file - 4 && queensRook.rank == piece.rank);
  }
  if(capturedPiece){
    board.splice(board.indexOf(capturedPiece), 1);
  }
  if(castleSide === 0 && !queensRook.moved){//Queen-side castle
    //Castling Animation
    queensRook.file += 3;
  } else if(castleSide === 1 && !kingsRook.moved){//King-side castle
    //Castling Animation
    kingsRook.file -= 2;
  } else if(piece.type === "p" && game.data.previousMoves[game.data.previousMoves.length].double){//En passant
    if(piece.color == 0){//White
      let pessantedPiece = game.data.board.find(pessantedPiece => pessantedPiece.file === move.to[0] && pessantedPiece.rank === (move.to[1]-1))
      board.splice(board.indexOf(pessantedPiece), 1);
    } else if(piece.color == 1){//Black
      let pessantedPiece = game.data.board.find(pessantedPiece => pessantedPiece.file === move.to[0] && pessantedPiece.rank === (move.to[1]+1))
      board.splice(board.indexOf(pessantedPiece), 1);
    }
  } else if(move.promotion){
    piece.type = move.promotion;
  }
  //Animation here
  piece.file = move.to[0], piece.rank = move.to[1];

  
  piece.moved = true;
  return game;
}

async function endTurn(game, action) {
  await GameFlow.endTurn(game);

  return game;
}

var exports = {
  movePiece,
  endTurn
}

export default exports;
