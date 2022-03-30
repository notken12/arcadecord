<template>
  <div class="board" ref="el">
    <div v-for="row in board.cells" :key="board.cells.indexOf(row)" class="row">
      <Cell
        v-for="cell in row"
        :key="cell.row + '-' + cell.col"
        :board="board"
        :cell="cell"
        :isblob="isCellBlob(cell)"
      ></Cell>
    </div>
  </div>
</template>

<script setup>
import Cell from './Cell.vue'
import Common from '/gamecommons/filler'
import GameFlow from '@app/js/GameFlow.js'
import { useFacade } from '@app/components/base-ui/facade'
import { computed, ref } from 'vue'
import { useAspectRatio } from '@app/components/base-ui/aspectRatio'

const el = ref(null)

const { game } = useFacade()

const board = computed(() => {
  return game.value.data.board
})

useAspectRatio(game.value.data.board.width / game.value.data.board.height, el)

const playerBlob = computed(() => {
  return Common.Board.getPlayerBlob(board.value, game.value.myIndex)
})

const isCellBlob = (cell) => {
  if (!GameFlow.isItMyTurn(game.value)) return false
  for (let coord of playerBlob.value) {
    if (cell.row === coord.row && cell.col === coord.col) {
      return true
    }
  }
  return false
}
</script>

<style lang="scss">
@use 'scss/base/theme' as theme;

$gap: 0px;

.board {
  display: flex;
  flex-direction: column;
  gap: $gap;
  box-shadow: theme.$md-elevation-level4;
  max-width: 400px;
  max-height: 350px;
}

.row {
  display: flex;
  flex-direction: row;
  gap: $gap;
  height: 100%;
  width: 100%;
}
</style>
