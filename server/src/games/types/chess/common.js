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
async function movePiece(game, action) {
  var turnColor;
  var i = ranks.indexOf(action.data.move[1])
  var j = files.indexOf(action.data.move[0])

  if (action.data.move.endsWith("Q")) {
    if (game.data.board[i][j] == "P") {
      game.data.board[i][j] = "Q"
    } else {
      game.data.board[i][j] = "q"
    }
  } else if (action.data.move.endsWith("R")) {
    if (game.data.board[i][j] == "P") {
      game.data.board[i][j] = "R"
    } else {
      game.data.board[i][j] = "r"
    }
  } else if (action.data.move.endsWith("B")) {
    if (game.data.board[i][j] == "P") {
      game.data.board[i][j] = "B"
    } else {
      game.data.board[i][j] = "b"
    }
  } else if (action.data.move.endsWith("N")) {
    if (game.data.board[i][j] == "P") {
      game.data.board[i][j] = "N"
    } else {
      game.data.board[i][j] = "n"
    }
  }
  /*
  if(game.data.board[i][j] == "P" || game.data.board[i][j] == "p"){
    //En passant!!!!!
  if(action.data.move == files[j]+ranks[i]+files[j+1]+ranks[i-1] && previousaction.data.moves[previousaction.data.moves.length-1] == files[j+1]+ranks[i-2]+files[j+1]+ranks[i]){
    game.data.board[i][j+1] = ""
  }
  if(action.data.move == files[j]+ranks[i]+files[j-1]+ranks[i-1] && previousaction.data.moves[previousaction.data.moves.length-1] == files[j-1]+ranks[i-2]+files[j-1]+ranks[i]){
    game.data.board[i][j-1] = ""
  }
  if(action.data.move == files[j]+ranks[i]+files[j+1]+ranks[i+1] && previousaction.data.moves[previousaction.data.moves.length-1] == files[j+1]+ranks[i+2]+files[j+1]+ranks[i]){
    game.data.board[i][j+1] = ""
  }
  if(action.data.move == files[j]+ranks[i]+files[j-1]+ranks[i+1] && previousaction.data.moves[previousaction.data.moves.length-1] == files[j-1]+ranks[i+2]+files[j-1]+ranks[i]){
    game.data.board[i][j-1] = ""
  }
  }

  //Short Castle
  if(game.data.board[i][j] == "K" && action.data.move == "e1g1"){
    action.data.movePiece("h1f1")
  }
  if(game.data.board[i][j] == "k" && action.data.move == "e8g8"){
    action.data.movePiece("h8f8")
  }
  //Long Castle
  if(game.data.board[i][j] == "K" && action.data.move == "e1c1"){
    action.data.movePiece("a1d1")
  }
  if(game.data.board[i][j] == "k" && action.data.move == "e8c8"){
    action.data.movePiece("a8d8");
  }
*/
  game.data.board[ranks.indexOf(action.data.move[3])][files.indexOf(action.data.move[2])] = game.data.board[ranks.indexOf(action.data.move[1])][files.indexOf(action.data.move[0])];
  game.data.board[ranks.indexOf(action.data.move[1])][files.indexOf(action.data.move[0])] = "";
  if (isGameOver(game.data.board, action.playerIndex) == 1) {
    await GameFlow.end(game, {
      winner: action.playerIndex
    })
  } else if (isGameOver(game.data.board, action.playerIndex) == 0) {
    await GameFlow.end(game, {
      winner: -1
    })
  } else {
    return endTurn(game);
  }
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
