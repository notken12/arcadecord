<template>
  <div class="board">
    <div v-for="rowNum in board.cells.length" :key="rowNum - 1" class="row">
      <cell
        v-for="cellNum in board.cells[rowNum - 1].length"
        :key="cellNum - 1"
        :board="board"
        :rownum="rowNum - 1"
        :cellnum="cellNum - 1"
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