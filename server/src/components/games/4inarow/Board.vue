<template>
  <div class="grid-container">

  </div>
  <!---
  <piece
    v-for="piece in board"
    :key="piece.id"
    :piece="piece"
  ></piece>
  --->
</template>
  <script>
    import Piece from './Piece.vue'

    export default {
      computed:{
      board() {
        return this.game.data.board
      }
    },
      components:{
        Piece
      }
    }
  </script>
  <style lang="scss">
    .grid-container{
      display:grid;
      column-gap:0px;
      row-gap:0px;
    }
  </style>
