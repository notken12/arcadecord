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

function recurse(board, moves, piece, location, offset, singleMove) {
  let { rank, file } = location
  let newFile = file + offset[0]
  let newRank = rank + offset[1]

  if (newFile < 0 || newFile > 7 || newRank < 0 || newRank > 7) {
    // Out of bounds
    return moves
  }

  var pieceAtLocation = board.find((piece) => piece.file === newFile && piece.rank === newRank)

  if (
    pieceAtLocation
  ) {
    // There's a piece here
    if (pieceAtLocation.color === piece.color) {
      // Same color piece
      // End recursion
      return moves
    } else {
      // Opponent piece
      // Can capture
      // End recursion
      moves.push({
        from: [piece.file, piece.rank],
        to: [newFile, newRank],
      })
      return moves
    }
  } else {
    // No piece here
    // Recurse

    // Add move
    moves.push({
      from: [piece.file, piece.rank],
      to: [newFile, newRank],
    })

    if (!singleMove) {
      return recurse(
        board,
        moves,
        piece,
        { rank: newRank, file: newFile },
        offset
      )
    } else {
      return moves
    }

  }
}

function getMoves(board, piece /*{color: 0 white 1 black, file: 0-7, rank: 0-7, type: lowercase letter, id, moved: bool}*/) {
  function isOutOfBounds(file, rank) {
    return rank < 0 || rank > 7 || file < 0 || file > 7
  }

  const offsets = {
    // [file, rank]
    r: [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ],
    b: [
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ],
    q: [
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ],
    k: [
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ],
    n: [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, -2],
      [-2, -1],
      [-2, 1],
      [-1, 2],
    ]
  }

  let singleMovePieces = ['k', 'n']

  let moves = []

  let offset = offsets[piece.type]
  if (offset) {
    for (let i = 0; i < offset.length; i++) {
      recurse(
        board,
        moves,
        piece,
        { rank: piece.rank, file: piece.file },
        offset[i],
        singleMovePieces.includes(piece.type)
      )
    }
  } else {
    // One of the oddball pieces
    // Pawn, Knight
    switch (piece.type) {
      case 'p':
        // Pawn
        let forward = piece.color === 0 ? 1 : -1

        let newFile = piece.file
        let newRank1 = piece.rank + forward

        let newRank2 = piece.rank + 2 * forward

        if (isOutOfBounds(newFile, newRank1)) {
          // Out of bounds
          return moves
        }

        if (!board.find((piece) => piece.file === newFile && piece.rank === newRank1)) {
          // No piece here
          // Moving 1 space forward is valid
          moves.push({
            from: [piece.file, piece.rank],
            to: [newFile, newRank1],
          })
        }



        if (piece.color === 0) {
          // White Pawn
          if (piece.rank === 1) {
            // Pawn can move 2 spaces

            if (!board.find((piece) => piece.file === newFile && piece.rank === newRank2)) {
              // No piece at new location, can move 2 spaces
              moves.push({
                from: [piece.file, piece.rank],
                to: [newFile, newRank2],
                double: true,
              })
            }


          }
        } else {
          // Black Pawn
          if (piece.rank === 6) {
            // Pawn can move 2 spaces

            if (!board.find((piece) => piece.file === newFile && piece.rank === newRank2)) {
              // No piece at new location, can move 2 spaces
              moves.push({
                from: [piece.file, piece.rank],
                to: [newFile, newRank2],
                double: true,
              })
            }
          }
        }

        // Pawn can capture diagonally
        let newFile1 = piece.file + 1
        let newFile2 = piece.file - 1

        if (!isOutOfBounds(newFile1, newRank1)) {
          // Right
          if (
            board.find(
              (piece) => piece.rank === newRank1 && piece.file === newFile1
            )
          ) {
            // There's a piece here
            moves.push({
              from: [piece.file, piece.rank],
              to: [newFile1, newRank1],
            })
          }
        }

        if (!isOutOfBounds(newFile2, newRank1)) {
          // Left
          if (
            board.find(
              (piece) => piece.rank === newRank1 && piece.file === newFile2
            )
          ) {
            // There's a piece here
            moves.push({
              from: [piece.file, piece.rank],
              to: [newFile2, newRank1],
            })
          }
        }
        break
    }
  }

  // Additional branching for castling
  if (piece.type === 'k') {
    let king = piece
    // Castling is only valid if the king and rook haven't moved
    // There must not be any pieces between the king and the rook
    // The king may not be in check
    // The king may not pass through a square that is under attack
    // It is okay if the rook is under attack

    if (king.moved) {
      // King has moved
      return moves
    }

    for (let i = 0; i < 2; i++) {
      // 0 is queens side, 1 is kings side
      let rook = board.find(
        (piece) =>
          piece.type === 'r' &&
          piece.color === king.color &&
          piece.rank === king.rank &&
          piece.file === (i === 0 ? 0 : 7)
      )

      if (!rook) {
        // No rook
        continue
      }

      if (rook.moved) {
        // Rook has moved
        continue
      }

      // Check if there are pieces between the king and the rook
      let piecesBetween = []
      let file = king.file
      let rank = king.rank

      file = i === 0 ? file - 1 : file + 1

      while (file !== rook.file && piecesBetween.length < 1) {
        let pieceBetween = board.find(
          (piece) => piece.rank === rank && piece.file === file
        )
        if (pieceBetween)
          piecesBetween.push(pieceBetween)
        file = i === 0 ? file - 1 : file + 1
      }

      if (piecesBetween.length > 0) {
        // There are pieces between the king and the rook
        continue
      }

      // Check if the king is in check
      if (isInCheck(board, king)) {
        // King is in check
        continue
      }

      // Check if the king passes through a square that is under attack
      let kingMoves;

      if (i === 0) {
        kingMoves = [
          [king.file - 1, king.rank],
          [king.file - 2, king.rank],
        ]
      } else {
        kingMoves = [
          [king.file + 1, king.rank],
          [king.file + 2, king.rank],
        ]
      }

      let attackedSquares = []
      for (let move of kingMoves) {
        if (isUnderAttack(board, move, king.color)) {
          attackedSquares.push(move)
        }
      }

      if (attackedSquares.length > 0) {
        // King passes through a square that is under attack
        continue
      }

      // King and rook are clear to castle
      moves.push({
        from: [king.file, king.rank],
        to: [i === 0 ? 2 : 6, king.rank],
        castle: i,
      })
    }
  }

  return moves
}

function isUnderAttack(board, square, friendlyColor) {
  // Returns true if the square is under attack by a piece of the opposite color
  let pieces = board.filter((piece) => piece.color !== friendlyColor)

  for (let piece of pieces) {
    let moves = getMoves(board, piece)
    for (let move of moves) {
      if (move.to[0] === square[0] && move.to[1] === square[1]) {
        return true
      }
    }
  }

  return false
}

function isInCheck(board, king) {
  return isUnderAttack(board, [king.file, king.rank], king.color)
}

class Piece {
  id // arbitrary ID for the piece
  color // 0 = white, 1 = black
  type // k = king, q = queen, r = rook, b = bishop, n = knight, p = pawn
  file // 0-7 (a-h)
  rank // 0-7
  moved // true if the piece has moved, only used for castling
  constructor(id, color, type, file, rank) {
    this.id = id
    this.color = color
    this.type = type
    this.file = file
    this.rank = rank
    this.moved = false
  }
}

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
  endTurn,
  getMoves,
  isInCheck,
  isUnderAttack,
  Piece
}

export default exports;
