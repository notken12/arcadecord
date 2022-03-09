<template>
  <div class="ratio vertical">
    <canvas width="500" height="500"></canvas>
    <div>
      <div class="ratio horizontal" style="position:relative">
        <canvas width="500" height="500"></canvas>
        <div class="board-front"></div>
        <div class="board-back"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import Piece from './Piece.vue'

  import GameFlow from '@app/js/GameFlow'
  import Common from '/gamecommons/chess'
  export default {
    components:{
      Piece
    }
  }
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;
.board-back{
  background-image:url(/dist/assets/4inarow/FullBack.svg);
  background-size:contain;
  position:absolute;
  width:100%;
  height:100%;
}
.board-front {
    background-image: url(/dist/assets/4inarow/FullFront.svg);
    background-size: contain;
  background-color: transparent;
  box-shadow: theme.$md-elevation-level5;
  box-sizing: border-box;
  position:absolute;
  z-index: 1;
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
</style>
