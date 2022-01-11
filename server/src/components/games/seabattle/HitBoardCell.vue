<template>
  <div class="hit-board-cell" :style="cellStyles" @click="cellClicked"></div>
</template>

<script>
import Common from '/gamecommons/seabattle'

export default {
  data() {
    return {
      animation: 'none',
    }
  },
  props: ['cell', 'board', 'game'],
  computed: {
    cellStyles() {
      var board = this.board
      board.ships = board.revealedShips

      var show = true
      if (Common.getShipAt(this.board, this.cell.x, this.cell.y)) {
        show = false
      }

      return {
        'background-image': show ? 'url(' + this.imgURL + ')' : 'none',
        animation: this.animation || 'none',
      }
    },
    imgURL() {
      return '/dist/assets/seabattle/cell-states/' + this.cell.state + '.png'
    },
  },
  methods: {
    cellClicked() {
      if (
        this.cell.state === Common.BOARD_STATE_EMPTY &&
        this.$root.game.isItMyTurn()
      )
        this.$root.targetedCell = this.cell
    },
    altText: function () {
      switch (this.cell.state) {
        case Common.CELL_STATE_HIT:
          return 'Hit'
        case Common.CELL_STATE_MISS:
          return 'Miss'
        case Common.CELL_STATE_EMPTY:
          return 'Unknown'
        default:
          return 'Unknown'
      }
    },
  },
  mounted() {
    this.game.client.on('set_animation', (pos, animation) => {
      if (this.cell.x === pos.x && this.cell.y === pos.y)
        this.animation = animation
    })
  },
}
</script>