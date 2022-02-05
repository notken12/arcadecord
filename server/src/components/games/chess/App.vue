<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->
    <!-- Using the scores-view component, create the score badges -->
    <scores-view>
      <!-- Display a score badge for each player -->
      <template v-slot="scoreView">
        <score-badge :scoreview="scoreView"></score-badge>
      </template>
    </scores-view>

    <div class="middle" v-on:click="cellClick">
      <!-- Game UI just for filler -->
      <board>
        <div class="grid-container">
          <div id="cella8">{{ board[0][0] }}</div>
          <div id="cellb8" class="darkCell">{{ board[0][1] }}</div>
          <div id="cellc8">{{ board[0][2] }}</div>
          <div id="celld8" class="darkCell">{{ board[0][3] }}</div>
          <div id="celle8">{{ board[0][4] }}</div>
          <div id="cellf8" class="darkCell">{{ board[0][5] }}</div>
          <div id="cellg8">{{ board[0][6] }}</div>
          <div id="cellh8" class="darkCell">{{ board[0][7] }}</div>
          <div id="cella7" class="darkCell">{{ board[1][0] }}</div>
          <div id="cellb7">{{ board[1][1] }}</div>
          <div id="cellc7" class="darkCell">{{ board[1][2] }}</div>
          <div id="celld7">{{ board[1][3] }}</div>
          <div id="celle7" class="darkCell">{{ board[1][4] }}</div>
          <div id="cellf7">{{ board[1][5] }}</div>
          <div id="cellg7" class="darkCell">{{ board[1][6] }}</div>
          <div id="cellh7">{{ board[1][7] }}</div>
          <div id="cella6">{{ board[2][0] }}</div>
          <div id="cellb6" class="darkCell">{{ board[2][1] }}</div>
          <div id="cellc6">{{ board[2][2] }}</div>
          <div id="celld6" class="darkCell">{{ board[2][3] }}</div>
          <div id="celle6">{{ board[2][4] }}</div>
          <div id="cellf6" class="darkCell">{{ board[2][5] }}</div>
          <div id="cellg6">{{ board[2][6] }}</div>
          <div id="cellh6" class="darkCell">{{ board[2][7] }}</div>
          <div id="cella5" class="darkCell">{{ board[3][0] }}</div>
          <div id="cellb5">{{ board[3][1] }}</div>
          <div id="cellc5" class="darkCell">{{ board[3][2] }}</div>
          <div id="celld5">{{ board[3][3] }}</div>
          <div id="celle5" class="darkCell">{{ board[3][4] }}</div>
          <div id="cellf5">{{ board[3][5] }}</div>
          <div id="cellg5" class="darkCell">{{ board[3][6] }}</div>
          <div id="cellh5">{{ board[3][7] }}</div>
          <div id="cella4">{{ board[4][0] }}</div>
          <div id="cellb4" class="darkCell">{{ board[4][1] }}</div>
          <div id="cellc4">{{ board[4][2] }}</div>
          <div id="celld4" class="darkCell">{{ board[4][3] }}</div>
          <div id="celle4">{{ board[4][4] }}</div>
          <div id="cellf4" class="darkCell">{{ board[4][5] }}</div>
          <div id="cellg4">{{ board[4][6] }}</div>
          <div id="cellh4" class="darkCell">{{ board[4][7] }}</div>
          <div id="cella3" class="darkCell">{{ board[5][0] }}</div>
          <div id="cellb3">{{ board[5][1] }}</div>
          <div id="cellc3" class="darkCell">{{ board[5][2] }}</div>
          <div id="celld3">{{ board[5][3] }}</div>
          <div id="celle3" class="darkCell">{{ board[5][4] }}</div>
          <div id="cellf3">{{ board[5][5] }}</div>
          <div id="cellg3" class="darkCell">{{ board[5][6] }}</div>
          <div id="cellh3">{{ board[5][7] }}</div>
          <div id="cella2">{{ board[6][0] }}</div>
          <div id="cellb2" class="darkCell">{{ board[6][1] }}</div>
          <div id="cellc2">{{ board[6][2] }}</div>
          <div id="celld2" class="darkCell">{{ board[6][3] }}</div>
          <div id="celle2">{{ board[6][4] }}</div>
          <div id="cellf2" class="darkCell">{{ board[6][5] }}</div>
          <div id="cellg2">{{ board[6][6] }}</div>
          <div id="cellh2" class="darkCell">{{ board[6][7] }}</div>
          <div id="cella1" class="darkCell">{{ board[7][0] }}</div>
          <div id="cellb1">{{ board[7][1] }}</div>
          <div id="cellc1" class="darkCell">{{ board[7][2] }}</div>
          <div id="celld1">{{ board[7][3] }}</div>
          <div id="celle1" class="darkCell">{{ board[7][4] }}</div>
          <div id="cellf1">{{ board[7][5] }}</div>
          <div id="cellg1" class="darkCell">{{ board[7][6] }}</div>
          <div id="cellh1">{{ board[7][7] }}</div>
        </div>
      </board>
    </div>
  </game-view>
</template>
<script>
import '@app/scss/base/_theme.scss'
import '@app/scss/games/chess.scss'
//♙♘♗♖♕♔♟︎♞♝♜♛♚
export default {
  data() {
    return {
      selectedSquare: undefined,
      selectedSquareMoves: [],
      ranks: '87654321',
      files: 'abcdefgh',
      otherFiles: 'hgfedcba',
      piecesBlack: ['p', 'n', 'b', 'r', 'q', 'k'],
      piecesWhite: ['P', 'N', 'B', 'R', 'Q', 'K'],
      side:"white"
    }
  },
  methods: {
    cellClick: function (event) {
      var cell = event.srcElement.id.replace('cell', '')
      if (!event.srcElement.id.includes('cell')) {
        if (document.getElementsByClassName('selected-square')[0]) {
          document
            .getElementsByClassName('selected-square')[0]
            .classList.remove('selected-square')
          this.selectedCell = undefined
          this.cellHighlights()
        }
      } else {
        //Clicked on a valid cell
        this.selectedCell = cell
        if (document.getElementsByClassName('selected-square')[0]) {
          document
            .getElementsByClassName('selected-square')[0]
            .classList.remove('selected-square')
        }
        document
          .getElementById('cell' + this.selectedCell)
          .classList.add('selected-square')
        this.cellHighlights()
      }
    },
    cellHighlights: function () {},
    movePiece: function (move, test, bot, board) {
      if (this.game.isItMyTurn() || bot || test) {
        var turnColor
        var i = this.ranks.indexOf(move[1])
        var j = this.files.indexOf(move[0])

        /*
if(move.endsWith("P") && !bot){
if(side=="white"){
  promotionMenuWhite = true;
} else {
  promotionMenuBlack = true;
}
return
} else if(move.endsWith("Q")){
  if(board[i][j] == "P"){
    board[i][j] = "Q"
  } else {
    board[i][j] = "q"
  }
} else if(move.endsWith("R")){
  if(board[i][j] == "P"){
    board[i][j] = "R"
  } else {
    board[i][j] = "r"
  }
} else if(move.endsWith("B")){
  if(board[i][j] == "P"){
    board[i][j] = "B"
  } else {
    board[i][j] = "b"
  }
} else if(move.endsWith("N")){
  if(board[i][j] == "P"){
    board[i][j] = "N"
  } else {
    board[i][j] = "n"
  }
}

if(board[i][j] == "P" || board[i][j] == "p"){
  //En passant!!!!!
if(move == files[j]+ranks[i]+files[j+1]+ranks[i-1] && previousMoves[previousMoves.length-1] == files[j+1]+ranks[i-2]+files[j+1]+ranks[i]){
  board[i][j+1] = ""
}
if(move == files[j]+ranks[i]+files[j-1]+ranks[i-1] && previousMoves[previousMoves.length-1] == files[j-1]+ranks[i-2]+files[j-1]+ranks[i]){
  board[i][j-1] = ""
}
if(move == files[j]+ranks[i]+files[j+1]+ranks[i+1] && previousMoves[previousMoves.length-1] == files[j+1]+ranks[i+2]+files[j+1]+ranks[i]){
  board[i][j+1] = ""
}
if(move == files[j]+ranks[i]+files[j-1]+ranks[i+1] && previousMoves[previousMoves.length-1] == files[j-1]+ranks[i+2]+files[j-1]+ranks[i]){
  board[i][j-1] = ""
}
}
*/
        //Short Castle
        if (board[i][j] == 'K' && move == 'e1g1') {
          this.movePiece('h1f1', undefined, undefined, board)
        }
        if (board[i][j] == 'k' && move == 'e8g8') {
          this.movePiece('h8f8', undefined, undefined, board)
        }
        //Long Castle
        if (board[i][j] == 'K' && move == 'e1c1') {
          this.movePiece('a1d1', undefined, undefined, board)
        }
        if (board[i][j] == 'k' && move == 'e8c8') {
          this.movePiece('a8d8', undefined, undefined, board)
        }

        board[this.ranks.indexOf(move[3])][this.files.indexOf(move[2])] =
          board[this.ranks.indexOf(move[1])][this.files.indexOf(move[0])]
        board[this.ranks.indexOf(move[1])][this.files.indexOf(move[0])] = ''
        return board
      }
    },
    legalChessMoves: function (white, board) {
      var moves = []
      var i
      var j
      var l
      if (white) {
        for (i = 0; i < 8; i++) {
          for (j = 0; j < 8; j++) {
            var stopYet = false
            if (board[i][j] == 'P') {
              try {
                if (
                  this.ranks[i] == 2 &&
                  board[i - 2][j] == '' &&
                  board[i - 1][j] == ''
                ) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j] +
                    (this.ranks[i] - 1 + 3)
                }
              } catch (err) {
                console.log(err)
              }
              if (board[i - 1][j] == '') {
                if (i == 1) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j] +
                    (this.ranks[i] - 1 + 2) +
                    'P'
                } else {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j] +
                    (this.ranks[i] - 1 + 2)
                }
              }
              if (this.piecesBlack.includes(board[i - 1][j - 1])) {
                moves[moves.length] =
                  this.files[j] +
                  this.ranks[i] +
                  this.files[j - 1] +
                  this.ranks[i - 1]
              }
              if (this.piecesBlack.includes(board[i - 1][j + 1])) {
                moves[moves.length] =
                  this.files[j] +
                  this.ranks[i] +
                  this.files[j + 1] +
                  this.ranks[i - 1]
              }
              //En Passant
              if (
                this.game.data.previousMoves[
                  this.game.data.previousMoves.length - 1
                ] ==
                this.files[j + 1] +
                  this.ranks[i - 2] +
                  this.files[j + 1] +
                  this.ranks[i]
              ) {
                moves[moves.length] =
                  this.files[j] +
                  this.ranks[i] +
                  this.files[j + 1] +
                  this.ranks[i - 1]
              }
              if (
                this.game.data.previousMoves[
                  this.game.data.previousMoves.length - 1
                ] ==
                this.files[j - 1] +
                  this.ranks[i - 2] +
                  this.files[j - 1] +
                  this.ranks[i]
              ) {
                moves[moves.length] =
                  this.files[j] +
                  this.ranks[i] +
                  this.files[j - 1] +
                  this.ranks[i - 1]
              }
            } else if (board[i][j] == 'R') {
              //Down
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i + l < 8) {
                  if (this.piecesBlack.includes(board[i + l][j])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - l)
                  } else if (this.piecesWhite.includes(board[i + l][j])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - l)
                  }
                }
              }
              stopYet = false
              //Up
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1) {
                  if (this.piecesBlack.includes(board[i - l][j])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - 1 + l + 1)
                  } else if (this.piecesWhite.includes(board[i - l][j])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - 1 + l + 1)
                  }
                }
              }
              stopYet = false
              //Left
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (j - l > -1) {
                  if (this.piecesBlack.includes(board[i][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i]
                  } else if (this.piecesWhite.includes(board[i][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i]
                  }
                }
              }
              stopYet = false
              //Right
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (j + l < 8) {
                  if (this.piecesBlack.includes(board[i][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i]
                  } else if (this.piecesWhite.includes(board[i][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i]
                  }
                }
              }
            } else if (board[i][j] == 'B') {
              //UR
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1 && j + l < 8) {
                  if (this.piecesBlack.includes(board[i - l][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i - l]
                  } else if (this.piecesWhite.includes(board[i - l][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i - l]
                  }
                }
              }
              stopYet = false
              //UL
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1 && j - l > -1) {
                  if (this.piecesBlack.includes(board[i - l][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i - l]
                  } else if (this.piecesWhite.includes(board[i - l][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i - l]
                  }
                }
              }
              stopYet = false
              //DL
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i + l < 8 && j - l > -1) {
                  if (this.piecesBlack.includes(board[i + l][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i + l]
                  } else if (this.piecesWhite.includes(board[i + l][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i + l]
                  }
                }
              }
              stopYet = false
              //DR
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i + l < 8 && j + l < 8) {
                  if (this.piecesBlack.includes(board[i + l][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i + l]
                  } else if (this.piecesWhite.includes(board[i + l][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i + l]
                  }
                }
              }
            } else if (board[i][j] == 'Q') {
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i + l < 8) {
                  if (this.piecesBlack.includes(board[i + l][j])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - l)
                  } else if (this.piecesWhite.includes(board[i + l][j])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - l)
                  }
                }
              }
              stopYet = false
              //Up
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1) {
                  if (this.piecesBlack.includes(board[i - l][j])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - 1 + l + 1)
                  } else if (this.piecesWhite.includes(board[i - l][j])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - 1 + l + 1)
                  }
                }
              }
              stopYet = false
              //Left
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (j - l > -1) {
                  if (this.piecesBlack.includes(board[i][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i]
                  } else if (this.piecesWhite.includes(board[i][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i]
                  }
                }
              }
              stopYet = false
              //Right
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (j + l < 8) {
                  if (this.piecesBlack.includes(board[i][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i]
                  } else if (this.piecesWhite.includes(board[i][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i]
                  }
                }
              }
              stopYet = false
              //UR
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1 && j + l < 8) {
                  if (this.piecesBlack.includes(board[i - l][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i - l]
                  } else if (this.piecesWhite.includes(board[i - l][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i - l]
                  }
                }
              }
              stopYet = false
              //UL
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1 && j - l > -1) {
                  if (this.piecesBlack.includes(board[i - l][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i - l]
                  } else if (this.piecesWhite.includes(board[i - l][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i - l]
                  }
                }
              }
              stopYet = false
              //DL
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i + l < 8 && j - l > -1) {
                  if (this.piecesBlack.includes(board[i + l][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i + l]
                  } else if (this.piecesWhite.includes(board[i + l][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i + l]
                  }
                }
              }
              stopYet = false
              //DR
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i + l < 8 && j + l < 8) {
                  if (this.piecesBlack.includes(board[i + l][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i + l]
                  } else if (this.piecesWhite.includes(board[i + l][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i + l]
                  }
                }
              }
            } else if (board[i][j] == 'N') {
              //UL
              if (i - 2 > -1 && j - 1 > -1) {
                if (!this.piecesWhite.includes(board[i - 2][j - 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 1] +
                    this.ranks[i - 2]
                }
              }
              if (i - 1 > -1 && j - 2 > -1) {
                if (!this.piecesWhite.includes(board[i - 1][j - 2])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 2] +
                    this.ranks[i - 1]
                }
              }
              //UR
              if (i - 2 > -1 && j + 1 < 8) {
                if (!this.piecesWhite.includes(board[i - 2][j + 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 1] +
                    this.ranks[i - 2]
                }
              }
              if (i - 1 > -1 && j + 2 < 8) {
                if (!this.piecesWhite.includes(board[i - 1][j + 2])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 2] +
                    this.ranks[i - 1]
                }
              }
              //DL
              if (i + 2 < 8 && j - 1 > -1) {
                if (!this.piecesWhite.includes(board[i + 2][j - 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 1] +
                    this.ranks[i + 2]
                }
              }
              if (i + 1 < 8 && j - 2 > -1) {
                if (!this.piecesWhite.includes(board[i + 1][j - 2])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 2] +
                    this.ranks[i + 1]
                }
              }
              //DR
              if (i + 2 < 8 && j + 1 < 8) {
                if (!this.piecesWhite.includes(board[i + 2][j + 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 1] +
                    this.ranks[i + 2]
                }
              }
              if (i + 1 < 8 && j + 2 < 8) {
                if (!this.piecesWhite.includes(board[i + 1][j + 2])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 2] +
                    this.ranks[i + 1]
                }
              }
            } else if (board[i][j] == 'K') {
              var l
              var kingMoved = false
              var rRookMoved = false
              var lRookMoved = false
              for (l = 0; l < this.game.data.previousMoves.length; l++) {
                if (kingMoved || rRookMoved) {
                  break
                }
                if (
                  this.game.data.previousMoves[l].startsWith('h1') ||
                  this.game.data.previousMoves[l].endsWith('h1')
                ) {
                  rRookMoved = true
                }
                if (
                  this.game.data.previousMoves[l].startsWith('a1') ||
                  this.game.data.previousMoves[l].endsWith('a1')
                ) {
                  lRookMoved = true
                }
                if (this.game.data.previousMoves[l].startsWith('e1')) {
                  kingMoved = true
                }
              }
              //Up
              if (i - 1 > -1) {
                if (!this.piecesWhite.includes(board[i - 1][j])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j] +
                    this.ranks[i - 1]
                }
              }
              //Down
              if (i + 1 < 8) {
                if (!this.piecesWhite.includes(board[i + 1][j])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j] +
                    this.ranks[i + 1]
                }
              }
              //Left
              if (j - 1 > -1) {
                if (!this.piecesWhite.includes(board[i][j - 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 1] +
                    this.ranks[i]
                  //Long Castle
                  if (
                    !kingMoved &&
                    !lRookMoved &&
                    board[i][j - 2] == '' &&
                    board[i][j - 3] == ''
                  ) {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - 2] +
                      this.ranks[i]
                  }
                }
              }
              //Right
              if (j + 1 < 8) {
                if (!this.piecesWhite.includes(board[i][j + 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 1] +
                    this.ranks[i]
                  //Short Castle
                  if (!kingMoved && !rRookMoved && board[i][j + 2] == '') {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + 2] +
                      this.ranks[i]
                  }
                }
              }
              //UL
              if (i - 1 > -1 && j - 1 > -1) {
                if (!this.piecesWhite.includes(board[i - 1][j - 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 1] +
                    this.ranks[i - 1]
                }
                //UR
                if (i - 1 > -1 && j + 1 < 8) {
                  if (!this.piecesWhite.includes(board[i - 1][j + 1])) {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + 1] +
                      this.ranks[i - 1]
                  }
                }
                //DL
                if (i + 1 < 8 && j - 1 > -1) {
                  if (!this.piecesWhite.includes(board[i + 1][j - 1])) {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - 1] +
                      this.ranks[i + 1]
                  }
                }
                //DR
                if (i + 1 < 8 && j + 1 < 8) {
                  if (!this.piecesWhite.includes(board[i + 1][j + 1])) {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + 1] +
                      this.ranks[i + 1]
                  }
                }
              }
            }
          }
        }
      } else {
        for (i = 0; i < 8; i++) {
          for (j = 0; j < 8; j++) {
            var stopYet = false
            if (board[i][j] == 'p') {
              try {
                if (
                  this.ranks[i] == 7 &&
                  board[i + 2][j] == '' &&
                  board[i + 1][j] == ''
                ) {
                  //Pawn moves foward 2 first move
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j] +
                    (this.ranks[i] - 2)
                }
              } catch (err) {
                console.log(err)
              }
              if (board[i + 1][j] == '') {
                //Promotion
                if (i == 6) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j] +
                    (this.ranks[i] - 1) +
                    'P'
                } else {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j] +
                    (this.ranks[i] - 1)
                }
              }
              if (this.piecesWhite.includes(board[i + 1][j + 1])) {
                moves[moves.length] =
                  this.files[j] +
                  this.ranks[i] +
                  this.files[j + 1] +
                  this.ranks[i + 1]
              }
              if (this.piecesWhite.includes(board[i + 1][j - 1])) {
                moves[moves.length] =
                  this.files[j] +
                  this.ranks[i] +
                  this.files[j - 1] +
                  this.ranks[i + 1]
              }
              //En Passant
              if (
                this.game.data.previousMoves[
                  this.game.data.previousMoves.length - 1
                ] ==
                this.files[j + 1] +
                  this.ranks[i + 2] +
                  this.files[j + 1] +
                  this.ranks[i]
              ) {
                moves[moves.length] =
                  this.files[j] +
                  this.ranks[i] +
                  this.files[j + 1] +
                  this.ranks[i + 1]
              }
              if (
                this.game.data.previousMoves[
                  this.game.data.previousMoves.length - 1
                ] ==
                this.files[j - 1] +
                  this.ranks[i + 2] +
                  this.files[j - 1] +
                  this.ranks[i]
              ) {
                moves[moves.length] =
                  this.files[j] +
                  this.ranks[i] +
                  this.files[j - 1] +
                  this.ranks[i + 1]
              }
            } else if (board[i][j] == 'r') {
              //Down
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i + l < 8) {
                  if (this.piecesWhite.includes(board[i + l][j])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - l)
                  } else if (this.piecesBlack.includes(board[i + l][j])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - l)
                  }
                }
              }
              stopYet = false
              //Up
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1) {
                  if (this.piecesWhite.includes(board[i - l][j])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - 1 + l + 1)
                  } else if (this.piecesBlack.includes(board[i - l][j])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - 1 + l + 1)
                  }
                }
              }
              stopYet = false
              //Left
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (j - l > -1) {
                  if (this.piecesWhite.includes(board[i][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i]
                  } else if (this.piecesBlack.includes(board[i][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i]
                  }
                }
              }
              stopYet = false
              //Right
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (j + l < 8) {
                  if (this.piecesWhite.includes(board[i][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i]
                  } else if (this.piecesBlack.includes(board[i][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i]
                  }
                }
              }
            } else if (board[i][j] == 'b') {
              //UR
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1 && j + l < 8) {
                  if (this.piecesWhite.includes(board[i - l][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i - l]
                  } else if (this.piecesBlack.includes(board[i - l][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i - l]
                  }
                }
              }
              stopYet = false
              //UL
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1 && j - l > -1) {
                  if (this.piecesWhite.includes(board[i - l][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i - l]
                  } else if (this.piecesBlack.includes(board[i - l][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i - l]
                  }
                }
              }
              stopYet = false
              //DL
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i + l < 8 && j - l > -1) {
                  if (this.piecesWhite.includes(board[i + l][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i + l]
                  } else if (this.piecesBlack.includes(board[i + l][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i + l]
                  }
                }
              }
              stopYet = false
              //DR
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i + l < 8 && j + l < 8) {
                  if (this.piecesWhite.includes(board[i + l][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i + l]
                  } else if (this.piecesBlack.includes(board[i + l][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i + l]
                  }
                }
              }
            } else if (board[i][j] == 'q') {
              //Down
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                }
                if (i + l < 8) {
                  if (this.piecesWhite.includes(board[i + l][j])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - l)
                  } else if (this.piecesBlack.includes(board[i + l][j])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - l)
                  }
                }
              }
              stopYet = false
              //Up
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1) {
                  if (this.piecesWhite.includes(board[i - l][j])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - 1 + l + 1)
                  } else if (this.piecesBlack.includes(board[i - l][j])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j] +
                      (this.ranks[i] - 1 + l + 1)
                  }
                }
              }

              stopYet = false
              //Left
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (j - l > -1) {
                  if (this.piecesWhite.includes(board[i][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i]
                  } else if (this.piecesBlack.includes(board[i][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i]
                  }
                }
              }
              stopYet = false
              //Right
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (j + l < 8) {
                  if (this.piecesWhite.includes(board[i][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i]
                  } else if (this.piecesBlack.includes(board[i][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i]
                  }
                }
              }
              stopYet = false
              //UR
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1 && j + l < 8) {
                  if (this.piecesWhite.includes(board[i - l][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i - l]
                  } else if (this.piecesBlack.includes(board[i - l][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i - l]
                  }
                }
              }
              stopYet = false
              //UL
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i - l > -1 && j - l > -1) {
                  if (this.piecesWhite.includes(board[i - l][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i - l]
                  } else if (this.piecesBlack.includes(board[i - l][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i - l]
                  }
                }
              }
              stopYet = false
              //DL
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i + l < 8 && j - l > -1) {
                  if (this.piecesWhite.includes(board[i + l][j - l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i + l]
                  } else if (this.piecesBlack.includes(board[i + l][j - l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - l] +
                      this.ranks[i + l]
                  }
                }
              }
              stopYet = false
              //DR
              for (l = 1; l < 9; l++) {
                if (stopYet) {
                  continue
                } else if (i + l < 8 && j + l < 8) {
                  if (this.piecesWhite.includes(board[i + l][j + l])) {
                    stopYet = true
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i + l]
                  } else if (this.piecesBlack.includes(board[i + l][j + l])) {
                    stopYet = true
                  } else {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + l] +
                      this.ranks[i + l]
                  }
                }
              }
            } else if (board[i][j] == 'n') {
              //UL
              if (i - 2 > -1 && j - 1 > -1) {
                if (!this.piecesBlack.includes(board[i - 2][j - 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 1] +
                    this.ranks[i - 2]
                }
              }
              if (i - 1 > -1 && j - 2 > -1) {
                if (!this.piecesBlack.includes(board[i - 1][j - 2])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 2] +
                    this.ranks[i - 1]
                }
              }
              //UR
              if (i - 2 > -1 && j + 1 < 8) {
                if (!this.piecesBlack.includes(board[i - 2][j + 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 1] +
                    this.ranks[i - 2]
                }
              }
              if (i - 1 > -1 && j + 2 < 8) {
                if (!this.piecesBlack.includes(board[i - 1][j + 2])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 2] +
                    this.ranks[i - 1]
                }
              }
              //DL
              if (i + 2 < 8 && j - 1 > -1) {
                if (!this.piecesBlack.includes(board[i + 2][j - 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 1] +
                    this.ranks[i + 2]
                }
              }
              if (i + 1 < 8 && j - 2 > -1) {
                if (!this.piecesBlack.includes(board[i + 1][j - 2])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 2] +
                    this.ranks[i + 1]
                }
              }
              //DR
              if (i + 2 < 8 && j + 1 < 8) {
                if (!this.piecesBlack.includes(board[i + 2][j + 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 1] +
                    this.ranks[i + 2]
                }
              }
              if (i + 1 < 8 && j + 2 < 8) {
                if (!this.piecesBlack.includes(board[i + 1][j + 2])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 2] +
                    this.ranks[i + 1]
                }
              }
            } else if (board[i][j] == 'k') {
              var l
              var kingMoved = false
              var rRookMoved = false
              var lRookMoved = false
              for (l = 0; l < this.game.data.previousMoves.length; l++) {
                if (kingMoved || rRookMoved) {
                  break
                }
                if (
                  this.game.data.previousMoves[l].startsWith('h8') ||
                  this.game.data.previousMoves[l].endsWith('h8')
                ) {
                  rRookMoved = true
                }
                if (
                  this.game.data.previousMoves[l].startsWith('a8') ||
                  this.game.data.previousMoves[l].endsWith('a8')
                ) {
                  lRookMoved = true
                }
                if (this.game.data.previousMoves[l].startsWith('e8')) {
                  kingMoved = true
                }
              }
              //Up
              if (i - 1 > -1) {
                if (!this.piecesBlack.includes(board[i - 1][j])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j] +
                    this.ranks[i - 1]
                }
              }
              //Down
              if (i + 1 < 8) {
                if (!this.piecesBlack.includes(board[i + 1][j])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j] +
                    this.ranks[i + 1]
                }
              }
              //Left
              if (j - 1 > -1) {
                if (!this.piecesBlack.includes(board[i][j - 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 1] +
                    this.ranks[i]
                  if (
                    !kingMoved &&
                    !lRookMoved &&
                    board[i][j - 2] == '' &&
                    board[i][j - 3] == ''
                  ) {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j - 2] +
                      this.ranks[i]
                  }
                }
              }
              //Right
              if (j + 1 < 8) {
                if (!this.piecesBlack.includes(board[i][j + 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 1] +
                    this.ranks[i]
                  if (!kingMoved && !rRookMoved && board[i][j + 2] == '') {
                    moves[moves.length] =
                      this.files[j] +
                      this.ranks[i] +
                      this.files[j + 2] +
                      this.ranks[i]
                  }
                }
              }
              //UL
              if (i - 1 > -1 && j - 1 > -1) {
                if (!this.piecesBlack.includes(board[i - 1][j - 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 1] +
                    this.ranks[i - 1]
                }
              }
              //UR
              if (i - 1 > -1 && j + 1 < 8) {
                if (!this.piecesBlack.includes(board[i - 1][j + 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 1] +
                    this.ranks[i - 1]
                }
              }
              //DL
              if (i + 1 < 8 && j - 1 > -1) {
                if (!this.piecesBlack.includes(board[i + 1][j - 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j - 1] +
                    this.ranks[i + 1]
                }
              }
              //DR
              if (i + 1 < 8 && j + 1 < 8) {
                if (!this.piecesBlack.includes(board[i + 1][j + 1])) {
                  moves[moves.length] =
                    this.files[j] +
                    this.ranks[i] +
                    this.files[j + 1] +
                    this.ranks[i + 1]
                }
              }
            }
          }
        }
      }
      return moves
    },
    allChessMoves: function (white, board) {
      var moves = this.legalChessMoves(white, board)
      var i
      for (i = 0; i < moves.length; i++) {
        var oldBoard = JSON.parse(JSON.stringify(board))
        this.movePiece(moves[i], true, true, board)
        if (this.isInCheck(white, board)) {
          moves.splice(i, 1)
          i -= 1
        }
        board = JSON.parse(JSON.stringify(oldBoard))
      }
      if (moves.includes('e1g1') && !moves.includes('e1f1')) {
        moves.splice(moves.indexOf('e1g1'), 1)
      }
      if (moves.includes('e1c1') && !moves.includes('e1d1')) {
        moves.splice(moves.indexOf('e1c1'), 1)
      }
      if (moves.includes('e8g8') && !moves.includes('e8f8')) {
        moves.splice(moves.indexOf('e8g8'), 1)
      }
      if (moves.includes('e1c8') && !moves.includes('e1d8')) {
        moves.splice(moves.indexOf('e8c8'), 1)
      }
      return moves
    },
    isInCheck: function (white, board) {
      var i
      var j
      var king
      for (i = 0; i < 8; i++) {
        for (j = 0; j < 8; j++) {
          if (board[i][j] == 'K' && white) {
            king = this.files[j] + this.ranks[i]
            break
          } else if (board[i][j] == 'k' && !white) {
            king = this.files[j] + this.ranks[i]
            break
          }
        }
      }
      var moves = this.legalChessMoves(!white, board)
      var l
      for (l = 0; l < moves.length; l++) {
        if (moves[l].endsWith(king)) {
          return true
        }
      }
      return false
    },
  },
  computed: {
    board() {
      var board = JSON.parse(JSON.stringify(this.game.data.board))
      var i
      var j
      for (i = 0; i < 8; i++) {
        for (j = 0; j < 8; j++) {
          board[i][j] = board[i][j].replace('P', '♙')
          board[i][j] = board[i][j].replace('N', '♘')
          board[i][j] = board[i][j].replace('B', '♗')
          board[i][j] = board[i][j].replace('R', '♖')
          board[i][j] = board[i][j].replace('Q', '♕')
          board[i][j] = board[i][j].replace('K', '♔')
          board[i][j] = board[i][j].replace('p', '♟︎')
          board[i][j] = board[i][j].replace('n', '♞')
          board[i][j] = board[i][j].replace('b', '♝')
          board[i][j] = board[i][j].replace('r', '♜')
          board[i][j] = board[i][j].replace('q', '♛')
          board[i][j] = board[i][j].replace('k', '♚')
        }
      }
      return board
    },
  },
  mounted() {
    console.log(
      this.allChessMoves(true, JSON.parse(JSON.stringify(this.game.data.board)))
    )
    if (this.game.myIndex == 0) {
      var parent = document.getElementsByClassName('grid-container')[0]
      for (var i = 1; i < parent.childNodes.length; i++) {
        parent.insertBefore(parent.childNodes[i], parent.firstChild)
      }
    }
  },
}
</script>