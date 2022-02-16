<template>
  <div class="board">
    <div v-for="row in board.cells" :key="board.cells.indexOf(row)" class="row">
      <cell
        v-for="cell in row"
        :key="cell.row + '-' + cell.col"
        :board="board"
        :cell="cell"
        :isblob="isCellBlob(cell)"
      ></cell>
    </div>
  </div>
</template>

<script>
import Cell from './Cell.vue'
import Common from '/gamecommons/filler'
import GameFlow from '@app/js/GameFlow.js'

export default {
  data() {
    return {
    }
  },
  components: {
    Cell,
  },
  computed: {
    playerBlob() {
      return Common.Board.getPlayerBlob(this.board, this.game.myIndex)
    },
    board() {
      return this.game.data.board
    },
  },
  methods: {
    isCellBlob(cell) {
      if (!GameFlow.isItMyTurn(this.game)) return false
      for (let coord of this.playerBlob) {
        if (cell.row === coord.row && cell.col === coord.col) {
          return true
        }
      }
      return false
    },
  },
}
</script>

<style lang="scss">
@use '../../../scss/base/_theme.scss' as theme;

$gap: 0px;

.board {
  display: flex;
  flex-direction: column;
  gap: $gap;
  box-shadow: theme.$md-elevation-level4;
}

.row {
  display: flex;
  flex-direction: row;
  gap: $gap;
}
</style>