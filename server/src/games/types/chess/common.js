import GameFlow from '../../GameFlow.js';
import cloneDeep from 'lodash.clonedeep'

//f
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
function newToOld(game) {
  var nums = [7, 6, 5, 4, 3, 2, 1, 0];
  var oldBoardVer = []
  var i;
  var j;
  //Setup Board
  for (i = 0; i < 8; i++) {
    oldBoardVer[i] = []
    for (j = 0; j < 8; j++) {
      oldBoardVer[i][j] = "";
    }
  }
  ////////////////

  //Individually Adds Pieces to the Board
  var i;
  for (i = 0; i < game.data.board.length; i++) {
    if (game.data.board[i].color == 0) {//White
      oldBoardVer[nums[game.data.board[i].rank]][game.data.board[i].file] = game.data.board[i].type.toUpperCase();
    } else {//Black
      oldBoardVer[nums[game.data.board[i].rank]][game.data.board[i].file] = game.data.board[i].type;
    }
  }
  return oldBoardVer
}
function generateFEN(board) {
  var i;
  var j;
  var fen = "";
  for (i = 0; i < 8; i++) {
    for (j = 0; j < 8; j++) {
      if (board[i][j] == "") {
        var l;
        var space = 1;
        var pieceYet = false;
        for (l = 0; l < 8; l++) {
          if (!pieceYet) {
            if (board[i][j + 1 + l] == "") {
              space += 1;
            } else {
              pieceYet = true;
            }
          }
        }
        j += space - 1;
        fen = fen + space;
      } else {
        fen = fen + board[i][j];
      }
    }
    if (i != 7) {
      fen = fen + "/";
    }
  }
  return fen;
}
function willMoveResultInCheck(game, move, color) {
  // Returns true if the move will result in check
  let newGame = cloneDeep(game)
  doMovePiece(newGame, move);
  return isInCheck(newGame, newGame.data.board.find((piece) => piece.type === "k" && piece.color === color))
}

function addMove(game, moves, move, color) {
  if (!willMoveResultInCheck(game, move, color)) {
    moves.push(move)
  }
}

function recurse(game, moves, piece, location, offset, singleMove) {
  let board = game.data.board;

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
      addMove(game, moves, {
        from: [piece.file, piece.rank],
        to: [newFile, newRank],
        capture: true,
        pieceType: piece.type
      }, piece.color)
      return moves
    }
  } else {
    // No piece here
    // Recurse

    // Add move
    addMove(game, moves, {
      from: [piece.file, piece.rank],
      to: [newFile, newRank],
      pieceType: piece.type
    }, piece.color)

    if (!singleMove) {
      return recurse(
        game,
        moves,
        piece,
        { rank: newRank, file: newFile },
        offset,
      )
    } else {
      return moves
    }

  }
}

function isOutOfBounds(file, rank) {
  return rank < 0 || rank > 7 || file < 0 || file > 7
}

function getMoves(game, piece /*{color: 0 white 1 black, file: 0-7, rank: 0-7, type: lowercase letter, id, moved: bool}*/) {
  let board = game.data.board;

  let moves = []

  let offset = offsets[piece.type]
  if (offset) {
    for (let i = 0; i < offset.length; i++) {
      recurse(
        game,
        moves,
        piece,
        { rank: piece.rank, file: piece.file },
        offset[i],
        singleMovePieces.includes(piece.type),
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

        let pieceAtRank1 = board.find((piece) => piece.file === newFile && piece.rank === newRank1)

        if (!pieceAtRank1) {
          // No piece here
          // Moving 1 space forward is valid
          addMove(game, moves, {
            from: [piece.file, piece.rank],
            to: [newFile, newRank1],
            pieceType: piece.type
          }, piece.color)
        }



        if (piece.color === 0) {
          // White Pawn
          if (piece.rank === 1 && !pieceAtRank1) {
            // Pawn can move 2 spaces

            if (!board.find((piece) => piece.file === newFile && piece.rank === newRank2)) {
              // No piece at new location, can move 2 spaces
              addMove(game, moves, {
                from: [piece.file, piece.rank],
                to: [newFile, newRank2],
                double: true,
                pieceType: piece.type
              }, piece.color)
            }


          }
        } else {
          // Black Pawn
          if (piece.rank === 6 && !pieceAtRank1) {
            // Pawn can move 2 spaces

            if (!board.find((piece) => piece.file === newFile && piece.rank === newRank2)) {
              // No piece at new location, can move 2 spaces
              addMove(game, moves, {
                from: [piece.file, piece.rank],
                to: [newFile, newRank2],
                double: true,
                pieceType: piece.type
              }, piece.color)
            }
          }
        }

        // Pawn can capture diagonally
        let newFile1 = piece.file + 1
        let newFile2 = piece.file - 1

        let previousMove = game.data.previousMoves[game.data.previousMoves.length - 1]
        let offset = 0
        if (previousMove) {
          if (previousMove.double) {
            offset = piece.color === 0 ? -1 : 1
          }
        }

        if (!isOutOfBounds(newFile1, newRank1)) {
          // Right
          if (
            board.find(
              (p) => (p.rank === newRank1 && p.file === newFile1 && p.color !== piece.color) ||
                (p.rank === newRank1 + offset && p.file === newFile1 && p.color !== piece.color && p.type === 'p') // en passant
            )
          ) {
            // There's a piece here
            addMove(game, moves, {
              from: [piece.file, piece.rank],
              to: [newFile1, newRank1],
              capture: true,
              pieceType: piece.type
            }, piece.color)
          }
        }

        if (!isOutOfBounds(newFile2, newRank1)) {
          // Left
          if (
            board.find(
              (p) => (p.rank === newRank1 && p.file === newFile2 && p.color !== piece.color) ||
                (p.rank === newRank1 + offset && p.file === newFile2 && p.color !== piece.color && p.type === 'p') // en passant
            )
          ) {
            // There's a piece here
            addMove(game, moves, {
              from: [piece.file, piece.rank],
              to: [newFile2, newRank1],
              capture: true,
              pieceType: piece.type
            }, piece.color)
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
      if (isInCheck(game, king)) {
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
        if (isUnderAttack(game, move, king.color)) {
          attackedSquares.push(move)
        }
      }

      if (attackedSquares.length > 0) {
        // King passes through a square that is under attack
        continue
      }

      // King and rook are clear to castle
      addMove(game, moves, {
        from: [king.file, king.rank],
        to: [i === 0 ? 2 : 6, king.rank],
        castle: i,
        pieceType: piece.type
      }, king.color)
    }
  }

  return moves
}

function checkAttack(game, location, offset, friendlyColor, pieceType, singleMove) {
  let board = game.data.board

  let [file, rank] = location
  let [fileOffset, rankOffset] = offset

  let newFile = file + fileOffset
  let newRank = rank + rankOffset

  if (isOutOfBounds(newFile, newRank)) {
    return false
  }

  let piece = board.find((piece) => piece.file === newFile && piece.rank === newRank)
  if (piece) {
    if (piece.color === friendlyColor || piece.type !== pieceType) {
      return false
    } else {
      return true
    }
  }

  if (!singleMove)
    return checkAttack(game, [newFile, newRank], offset, friendlyColor, pieceType)

  return false
}

function isUnderAttack(game, square, friendlyColor) {
  for (let pieceType in offsets) {
    let pieceOffsets = offsets[pieceType]
    for (let offset of pieceOffsets) {
      if (checkAttack(game, square, offset, friendlyColor, pieceType, singleMovePieces.includes(pieceType))) {
        return true
      }
    }
  }

  // Check for pawn attacks
  let forward = friendlyColor === 0 ? 1 : -1
  let pawn1 = game.data.board.find(
    (piece) =>
      piece.type === 'p' &&
      piece.color !== friendlyColor &&
      piece.file === square[0] - 1 &&
      piece.rank === square[1] + forward
  )

  if (pawn1) {
    return true
  }

  let pawn2 = game.data.board.find(
    (piece) =>
      piece.type === 'p' &&
      piece.color !== friendlyColor &&
      piece.file === square[0] + 1 &&
      piece.rank === square[1] + forward
  )

  if (pawn2) {
    return true
  }

  return false
}

function isInCheck(game, king) {
  if (king)
    return isUnderAttack(game, [king.file, king.rank], king.color)
  else
    return false
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

function validateMove(game, move) {
  let piece = game.data.board.find((piece) => piece.file === move.from[0] && piece.rank === move.from[1])
  let moves = getMoves(game, piece)
  if (moves.find((m) => m.to[0] === move.to[0] && m.to[1] === move.to[1] && m.castle === move.castle && m.pieceType === move.pieceType)) {
    if (move.promotion) {
      if (piece.type === 'p' && !(['p', 'k'].includes(move.promotion))) {
        return true;
      }
    } else {
      return true;
    }
  }
  return false;
}

async function movePiece(game, action /*from:[file, rank], to:[file, rank], castleSide: 0 for queen-side, 1 for king-side, promotion: piece type, double: if pawn moves 2 squares | this is for en passant*/) {
  let move = action.data.move;

  if (!validateMove(game, move)) {
    return false;
  }

  doMovePiece(game, move);
  game.data.previousMoves.push(action.data.move);
  game.data.previousBoardPos.push(generateFEN(newToOld(game)))
  let situation = getSituation(game, game.data.colors[(game.turn + 1) % 2])

  // TODO: add 3 fold repetition

  if (!situation) {
    await GameFlow.endTurn(game);
    return game;
  } else if (situation === 'checkmate') {
    await GameFlow.end(game, {
      winner: game.turn
    })
    return game;
  } else if (situation === 'stalemate') {
    await GameFlow.end(game, {
      winner: -1 //Draw
    })
    return game;
  } else if (situation === 'repitition') {
    await GameFlow.end(game, {
      winner: -1 //Draw
    })
    return game;
  } else if(situation === '50move'){
    await GameFlow.end(game, {
      winner: -1 //Draw
    })
    return game;
  } else if(situation === 'insufficiantMaterial'){
    await GameFlow.end(game, {
      winner: -1 //Draw
    })
    return game;
  }
}

async function resign(game, action) {
  await GameFlow.end(game, {
    winner: [1, 0][game.turn]
  })
  return game;
}

async function offerDraw(game, action) {
  game.data.drawoffered[0] = true;
  game.data.drawoffered[1] = game.turn;
  return game;
}
async function drawDecision(game, action) {
  if (game.data.drawoffered[0] !== game.turn) {
    if (action.data.decision === 'draw') {
      await GameFlow.end(game, {
        winner: -1 //Draw
      })
    } else {
      game.data.drawoffered[0] = false;
      game.data.drawoffered[1] = undefined;
    }
    return game;
  }
}

async function cancelDraw(game, action) {
  game.data.drawoffered[0] = false;
  game.data.drawoffered[1] = undefined;
  return game;
}

function getSituation(game, color) {
  let king = game.data.board.find((piece) => piece.type === 'k' && piece.color === color)

  let board = game.data.board;
  let pieces = board.filter((piece) => piece.color === color);
  let legalMoves = [];
  for (let piece of pieces) {
    legalMoves = legalMoves.concat(getMoves(game, piece));
  }

  if (legalMoves.length === 0) {
    if (isInCheck(game, king)) {
      return 'checkmate';
    } else {
      return 'stalemate';
    }
  }
  var i;
  for (i = 0; i < game.data.previousBoardPos.length; i++) {
    var keepSearching = true;
    var startFrom = i + 1;
    var occurences = 1;
    while (keepSearching) {
      if (game.data.previousBoardPos.includes(game.data.previousBoardPos[i], startFrom)) {
        startFrom = game.data.previousBoardPos.indexOf(game.data.previousBoardPos[i], startFrom) + 1;
        occurences += 1;
      } else {
        keepSearching = false;
      }
      if (occurences >= 3) {
        return 'repitition'
      }
    }
  }
  var i;
  var movesSinceCounter = 0;
  for(i=0;i<game.data.previousMoves.length;i++){
    if(game.data.previousMoves[game.data.previousMoves.length-1].capture || game.data.previousMoves[game.data.previousMoves.length-1].pieceType === 'p'){
      movesSinceCounter = 0;
    } else {
      movesSinceCounter += 1;
    }

    if(movesSinceCounter >= 100){//Shouldn't ever get over 50 but idk
      return '50move'
    }
  }

  var i;
  var amountOfMaterialWhite = {
    "p":0,
    "b":0,
    "n":0,
    "r":0,
    "q":0
  }
  var amountOfMaterialBlack = {
    "p":0,
    "b":0,
    "n":0,
    "r":0,
    "q":0
  }
  for(i=0;i<game.data.board;i++){
      if(game.data.board[i].color = 0){//White
        amountOfMaterialWhite[game.data.board[i].piecetype] += 1;
      } else {//Black
        amountOfMaterialBlack[game.data.board[i].piecetype] += 1;
      }
  }
  if(amountOfMaterialWhite.p === 0 && amountOfMaterialWhite.r === 0 && amountOfMaterialWhite.q === 0 && amountOfMaterialBlack.p === 0 && amountOfMaterialBlack.r === 0 && amountOfMaterialBlack.q === 0){
    if(( (amountOfMaterialWhite.n >= 3) || (amountOfMaterialWhite.b >= 2) || (amountOfMaterialWhite.b >= 1 && amountOfMaterialWhite.n >= 1) ) || ( (amountOfMaterialBlack.n >= 3) || (amountOfMaterialBlack.b >= 2) || (amountOfMaterialBlack.b >= 1 && amountOfMaterialBlack.n >= 1) )){
      return 'insufficiantMaterial';
    }
  }

  return null;
}

function doMovePiece(game, move) {
  let board = game.data.board;

  let piece = game.data.board.find(piece => piece.file === move.from[0] && piece.rank === move.from[1]);
  let capturedPiece = game.data.board.find(capturedPiece => capturedPiece.file === move.to[0] && capturedPiece.rank === move.to[1]);

  let castleSide = move.castle;

  let previousMove = game.data.previousMoves[game.data.previousMoves.length - 1]

  let kingsRook;
  let queensRook;
  if (castleSide !== undefined && castleSide !== null && !piece.moved && piece.type === 'k') {
    kingsRook = game.data.board.find(p => p.file === 7 && p.rank === piece.rank);
    queensRook = game.data.board.find(p => p.file === 0 && p.rank == piece.rank);

    if (castleSide === 0) {
      if (!queensRook)
        return false
      queensRook.file += 3;

    } else if (castleSide === 1) {
      if (!kingsRook)
        return false
      kingsRook.file -= 2;
    }
  }

  if (capturedPiece) {
    board.splice(board.indexOf(capturedPiece), 1);
  }

  if (piece.type === "p" && previousMove) {//En passant
    if (previousMove.double) {
      let offset = piece.color === 0 ? -1 : 1;
      let pessantedPiece = game.data.board.find(pessantedPiece => pessantedPiece.file === move.to[0] && pessantedPiece.rank === (move.to[1] + offset) && pessantedPiece.type === "p" && pessantedPiece.color !== piece.color);
      if (pessantedPiece)
        board.splice(board.indexOf(pessantedPiece), 1);
    }
  }
  if (piece.type === "p" && move.promotion) {
    if (move.promotion !== 'p' && move.promotion !== 'k')
      piece.type = move.promotion;
  }
  piece.file = move.to[0], piece.rank = move.to[1];


  piece.moved = true;

  return game;
}

var exports = {
  movePiece,
  getMoves,
  isInCheck,
  isUnderAttack,
  resign,
  offerDraw,
  drawDecision,
  cancelDraw,
  Piece
}

export default exports;
