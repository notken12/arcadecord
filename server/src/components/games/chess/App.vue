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

    <div class="middle">
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

//♙♘♗♖♕♔♟︎♞♝♜♛♚
export default {
    data(){
        return {
        }
    },
    methods:{

    }, 
    computed:{
        toUnicode(){

        }, 
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

    },

}
</script>
<style lang="scss">
.grid-container{
    display:grid;
    background-color: white;
     grid-gap: 0px;
    grid-template-columns: 80px 80px 80px 80px 80px 80px 80px 80px;
    grid-template-rows: 80px 80px 80px 80px 80px 80px 80px 80px;
    text-align: center;
    font-size:  50px
}
.grid-container div:not(.darkCell){

}
.darkCell{
  background-color: rgb(224, 199, 228);
}
</style>