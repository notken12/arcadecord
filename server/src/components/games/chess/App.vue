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

    <div class="middle"   v-on:click="cellClick">
      <!-- Game UI just for filler -->
      <board>
          <div class="grid-container">
            <div id='cella8'>{{board[0][0]}}</div>
<div id='cellb8' class="darkCell">{{board[0][1]}}</div>
<div id='cellc8'>{{board[0][2]}}</div>
<div id='celld8' class="darkCell">{{board[0][3]}}</div>
<div id='celle8'>{{board[0][4]}}</div>
<div id='cellf8' class="darkCell">{{board[0][5]}}</div>
<div id='cellg8'>{{board[0][6]}}</div>
<div id='cellh8' class="darkCell">{{board[0][7]}}</div>
<div id='cella7' class="darkCell">{{board[1][0]}}</div>
<div id='cellb7'>{{board[1][1]}}</div>
<div id='cellc7' class="darkCell">{{board[1][2]}}</div>
<div id='celld7'>{{board[1][3]}}</div>
<div id='celle7' class="darkCell">{{board[1][4]}}</div>
<div id='cellf7'>{{board[1][5]}}</div>
<div id='cellg7' class="darkCell">{{board[1][6]}}</div>
<div id='cellh7'>{{board[1][7]}}</div>
<div id='cella6'>{{board[2][0]}}</div>
<div id='cellb6' class="darkCell">{{board[2][1]}}</div>
<div id='cellc6'>{{board[2][2]}}</div>
<div id='celld6' class="darkCell">{{board[2][3]}}</div>
<div id='celle6'>{{board[2][4]}}</div>
<div id='cellf6' class="darkCell">{{board[2][5]}}</div>
<div id='cellg6'>{{board[2][6]}}</div>
<div id='cellh6' class="darkCell">{{board[2][7]}}</div>
<div id='cella5' class="darkCell">{{board[3][0]}}</div>
<div id='cellb5'>{{board[3][1]}}</div>
<div id='cellc5' class="darkCell">{{board[3][2]}}</div>
<div id='celld5'>{{board[3][3]}}</div>
<div id='celle5' class="darkCell">{{board[3][4]}}</div>
<div id='cellf5'>{{board[3][5]}}</div>
<div id='cellg5' class="darkCell">{{board[3][6]}}</div>
<div id='cellh5'>{{board[3][7]}}</div>
<div id='cella4'>{{board[4][0]}}</div>
<div id='cellb4' class="darkCell">{{board[4][1]}}</div>
<div id='cellc4'>{{board[4][2]}}</div>
<div id='celld4' class="darkCell">{{board[4][3]}}</div>
<div id='celle4'>{{board[4][4]}}</div>
<div id='cellf4' class="darkCell">{{board[4][5]}}</div>
<div id='cellg4'>{{board[4][6]}}</div>
<div id='cellh4' class="darkCell">{{board[4][7]}}</div>
<div id='cella3' class="darkCell">{{board[5][0]}}</div>
<div id='cellb3'>{{board[5][1]}}</div>
<div id='cellc3' class="darkCell">{{board[5][2]}}</div>
<div id='celld3'>{{board[5][3]}}</div>
<div id='celle3' class="darkCell">{{board[5][4]}}</div>
<div id='cellf3'>{{board[5][5]}}</div>
<div id='cellg3' class="darkCell">{{board[5][6]}}</div>
<div id='cellh3'>{{board[5][7]}}</div>
<div id='cella2'>{{board[6][0]}}</div>
<div id='cellb2' class="darkCell">{{board[6][1]}}</div>
<div id='cellc2'>{{board[6][2]}}</div>
<div id='celld2' class="darkCell">{{board[6][3]}}</div>
<div id='celle2'>{{board[6][4]}}</div>
<div id='cellf2' class="darkCell">{{board[6][5]}}</div>
<div id='cellg2'>{{board[6][6]}}</div>
<div id='cellh2' class="darkCell">{{board[6][7]}}</div>
<div id='cella1' class="darkCell">{{board[7][0]}}</div>
<div id='cellb1'>{{board[7][1]}}</div>
<div id='cellc1' class="darkCell">{{board[7][2]}}</div>
<div id='celld1'>{{board[7][3]}}</div>
<div id='celle1' class="darkCell">{{board[7][4]}}</div>
<div id='cellf1'>{{board[7][5]}}</div>
<div id='cellg1' class="darkCell">{{board[7][6]}}</div>
<div id='cellh1'>{{board[7][7]}}</div>
          </div>
      </board>
    </div>
  </game-view>
</template>
<script>
import "@app/scss/base/_theme.scss"
import "@app/scss/games/chess.scss"
//♙♘♗♖♕♔♟︎♞♝♜♛♚
export default {
    data(){
        return {
          selectedSquare: undefined,
          ranks:"87654321",
          files:"abcdefgh",
          otherFiles:"hgfedcba"
        }
    },
    methods:{
      cellClick: function(event){
        var cell = event.srcElement.id.replace("cell", "");
        if(!event.srcElement.id.includes("cell")){
          if(document.getElementsByClassName("selected-square")[0]){
          document.getElementsByClassName("selected-square")[0].classList.remove('selected-square')
          this.selectedCell = undefined;
          this.cellHighlights();
          }
        } else {
          //Clicked on a valid cell
          this.selectedCell = cell;
if(document.getElementsByClassName("selected-square")[0]){
          document.getElementsByClassName("selected-square")[0].classList.remove('selected-square')
}
          document.getElementById("cell" + this.selectedCell).classList.add("selected-square")
          this.game.data.board = this.movePiece("e2e4", undefined, undefined, this.game.data.board)
          this.cellHighlights();
        
        }
      },
      cellHighlights: function(){

      },
      movePiece: function(move, test, bot, board){
        if(this.game.isItMyTurn() || bot || test){
var turnColor;
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
if(board[i][j] == "K" && move == "e1g1"){
  this.movePiece("h1f1", undefined, undefined, board)
}
if(board[i][j] == "k" && move == "e8g8"){
  this.movePiece("h8f8", undefined, undefined, board)
}
//Long Castle
if(board[i][j] == "K" && move == "e1c1"){
  this.movePiece("a1d1", undefined, undefined, board)
}
if(board[i][j] == "k" && move == "e8c8"){
  this.movePiece("a8d8", undefined, undefined, board)
}

board[this.ranks.indexOf(move[3])][this.files.indexOf(move[2])] = board[this.ranks.indexOf(move[1])][this.files.indexOf(move[0])];
board[this.ranks.indexOf(move[1])][this.files.indexOf(move[0])] = "";
return board;
}
      }
    }, 
    computed:{
        board(){
          var board = this.game.data.board;
          var i;
          var j;
          for(i=0;i<8;i++){
            for(j=0;j<8;j++){
              board[i][j] = board[i][j].replace("P", "♙")
              board[i][j] = board[i][j].replace("N", "♘")
              board[i][j] = board[i][j].replace("B", "♗")
              board[i][j] = board[i][j].replace("R", "♖")
              board[i][j] = board[i][j].replace("Q", "♕")
              board[i][j] = board[i][j].replace("K", "♔")
              board[i][j] = board[i][j].replace("p", "♟︎")
              board[i][j] = board[i][j].replace("n", "♞")
              board[i][j] = board[i][j].replace("b", "♝")
              board[i][j] = board[i][j].replace("r", "♜")
              board[i][j] = board[i][j].replace("q", "♛")
              board[i][j] = board[i][j].replace("k", "♚")
            }
          }
            return board;
        }
    },
    mounted(){
      console.log(this.game)
      if(!this.game.isItMyTurn()){
      var parent = document.getElementsByClassName("grid-container")[0];
 for (var i = 1; i < parent.childNodes.length; i++){
        parent.insertBefore(parent.childNodes[i], parent.firstChild);
    }
      }
    },

}
</script>