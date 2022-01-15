<template>
  <div class="board">
    <div v-for="rowNum in board.cells.length" :key="rowNum - 1" class="row">
      <cell
        v-for="cell in board.cells[rowNum - 1]"
        :key="cell.id"
        :board="board"
        :cell="cell"
      ></cell>
    </div>
  </div>
</template>

<script>
import Cell from './Cell.vue'

export default {
  props: ['board'],
  data() {
    return {}
  },
  components: {
    Cell,
  },
}
</script>

<style lang="scss">
$gap: 0px;

.board {
    display:flex;
    flex-direction: column;
    gap: $gap;
}

.row {
  display: flex;
  flex-direction: row;
  gap: $gap;
}
</style>