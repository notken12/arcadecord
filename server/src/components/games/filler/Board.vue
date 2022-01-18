<template>
  <div class="board">
    <div v-for="row in board.cells" :key="board.cells.indexOf(row)" class="row">
      <cell
        v-for="cell in row"
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
@use '../../../scss/base/_theme.scss' as theme;

$gap: 0px;

.board {
    display:flex;
    flex-direction: column;
    gap: $gap;
    box-shadow: theme.$md-elevation-level2;
}

.row {
  display: flex;
  flex-direction: row;
  gap: $gap;
}
</style>