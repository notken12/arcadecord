<template>
  <div class="ratio vertical">
    <canvas width="350" height="300"></canvas>
    <div>
      <div class="ratio horizontal" style="position:relative" @changeColumn="changeColumn($event)">
        <canvas width="350" height="300"></canvas>
        <div class="board-front">
          <ColumnOverlay v-for="col in board.width" :selectedColumn="selectedColumn" :column="col-1"></ColumnOverlay>
        </div>
        <div class="board-back">
          <piece v-for="piece in board.pieces" :piece="piece"></piece>
        </div>
      </div>
    </div>
  </div>
  <DropButton v-if="buttonShowing" :selectedColumn="selectedColumn"></DropButton>
</template>

<script>
  import Piece from './Piece.vue'
  import DropButton from './dropButton.vue'
  import ColumnOverlay from './ColumnOverlay.vue'
  import OverPiece from './OverPiece.vue'

  import GameFlow from '@app/js/GameFlow'
  import Common from '/gamecommons/chess'
  import bus from '@app/js/vue-event-bus'
  export default {
    data(){
      return{
        selectedColumn:null
      }
    },
    computed:{
      board(){
        return this.game.data.board
      },
      buttonShowing(){
        if(this.selectedColumn || this.selectedColumn === 0) return true
      }
    },
    mounted(){
      bus.on('changeColumn', (column) => {
        this.selectedColumn = column
      })
    },
    components:{
      Piece,
      DropButton,
      ColumnOverlay,
      OverPiece
    }
  }
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;
.overUI{
  margin:auto;
}
.board-back{
  background-image:url(/dist/assets/4inarow/FullBack.svg);
  background-size:contain;
  position:absolute;
  width:100%;
  height:100%;
}
.board-front {
  cursor:pointer;
  background-image: url(/dist/assets/4inarow/FullFront.svg);
  background-size: contain;
  background-color: transparent;
  box-shadow: theme.$md-elevation-level5;
  box-sizing: border-box;
  position:absolute;
  width:100%;
  height:100%;
  z-index: 1;
  display: flex;
}
.grid-container {
  background-size: contain;
  box-sizing: border-box;
  // position: absolute;
  // top: 0;
  // left: 0;
  // right: 0;
  // bottom: 0;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.highlight,
.highlight-click,
.selected-square {
  position: absolute;
  width: 12.5%;
  height: 12.5%;
  background-color: #0004ff4b;
}

.highlight-click {
  background: none;
  cursor: pointer;
}

.highlight {
  background: url('/dist/assets/chess/highlight.svg');
  background-size: contain;
}

.capture {
  background: url('/dist/assets/chess/capture.svg');
  background-size: contain;
}

.ratio.vertical, .ratio.vertical > canvas {
max-width: 500px;
}
</style>
