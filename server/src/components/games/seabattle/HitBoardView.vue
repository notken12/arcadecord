<template>
  <div class="hit-board" :style="styles">
    <div class="hit-board-ships">
      <placed-ship
        v-for="ship in board.revealedShips"
        :key="ship.id"
        :ship="ship"
        :board="board"
      >
      </placed-ship>
    </div>

    <div class="hit-board-grid">
      <div
        class="hit-board-row"
        v-for="row in board.cells"
        :key="board.cells.indexOf(row)"
      >
        <hit-board-cell
          v-for="cell in row"
          :key="cell.id"
          :cell="cell"
          :board="board"
          :game="game"
        ></hit-board-cell>
      </div>
    </div>

    <transition name="fade">
      <div class="target-crosshair" v-if="target" :style="targetStyles">
        <img src="@app/public/assets/seabattle/crosshair.png" />
      </div>
    </transition>
  </div>
</template>

<script>
import HitBoardCell from './HitBoardCell.vue'
import PlacedShip from './PlacedShip.vue'

export default {
  props: ['board', 'target'],
  data() {
    return {}
  },
  computed: {
    styles() {
      return {
        'background-size':
          (1 / this.board.width) * 100 +
          '% ' +
          (1 / this.board.height) * 100 +
          '%',
      }
    },
    targetStyles() {
      return {
        left: (this.target.x / this.board.width) * 100 + '%',
        top: (this.target.y / this.board.height) * 100 + '%',
        width: (1 / this.board.width) * 100 + '%',
        height: (1 / this.board.height) * 100 + '%',
      }
    },
  },
  components: {
    HitBoardCell,
    PlacedShip,
  },
}
</script>