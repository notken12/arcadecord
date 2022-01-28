<template>
  <div class="ship-placer-container">
    <div class="ship-placer-grid" :style="gridStyles">
      <placed-ship
        v-for="ship of board.ships"
        :ship="ship"
        :board="board"
        :selected="dragTarget == ship"
        :key="ship.id"
      ></placed-ship>
    </div>

    <div
      class="ship-placer-board"
      @touchmove="touchmove($event)"
      @touchend="mouseup($event)"
      ref="board"
    >
      <div class="ship-placer-row" v-for="y in board.width" :key="y">
        <div
          class="ship-placer-cell"
          v-for="x in board.height"
          :key="x"
          :x="x - 1"
          :y="y - 1"
          @mouseover="mouseover($event, x - 1, y - 1)"
          @mousedown="mousedown($event, x - 1, y - 1)"
          @mouseup="mouseup($event, x - 1, y - 1)"
          @touchstart="touchstart($event, x - 1, y - 1)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import bus from '@app/js/vue-event-bus'
import Common from '/gamecommons/seabattle';
import PlacedShip from './PlacedShip.vue'
import cloneDeep from 'lodash.clonedeep'

export default {
  data() {
    return {
      dragTarget: null,
      lastMove: {},
      targetMoved: false,
    }
  },
  props: ['board'],
  computed: {
    gridStyles() {
      var board = this.board
      return {
        'grid-template-columns': `repeat(${board.width}, ${
          100 / board.width
        }%)`,
        'grid-template-rows': `repeat(${board.height}, ${100 / board.height}%)`,
        'background-size': 100 / board.width + '% ' + 100 / board.height + '%',
      }
    },
  },
  methods: {
    touchmove(e) {
      e.preventDefault()

      var b = this.$refs.board.getBoundingClientRect()

      var x = Math.floor(
        ((e.touches[0].clientX - b.left) / b.width) * this.board.width
      )
      var y = Math.floor(
        ((e.touches[0].clientY - b.top) / b.height) * this.board.height
      )

      if (this.lastMove.x != x || this.lastMove.y != y) {
        if (this.dragTarget && bus.mouseIsDown)
          this.moveShip({ x: x - this.dragOffset.x, y: y - this.dragOffset.y })
      }
      this.lastMove = { x: x, y: y }
    },
    touchstart(e, x, y) {
      e.preventDefault()

      var ship = Common.getShipAt(this.board, x, y)

      if (ship) {
        var offsetX = x - ship.x
        var offsetY = y - ship.y
        this.dragOffset = { x: offsetX, y: offsetY } // what part of the ship is being dragged

        bus.mouseIsDown = true

        this.mouseLandingPoint = { x, y }
        this.dragTarget = ship
        this.initialDragTargetPosition = { x: ship.x + 0, y: ship.y + 0 }
      } else {
        this.dragTarget = null
      }
    },
    mouseover(e, x, y) {
      if (this.lastMove.x != x || this.lastMove.y != y) {
        if (this.dragTarget && bus.mouseIsDown)
          this.moveShip({ x: x - this.dragOffset.x, y: y - this.dragOffset.y })
      }
      this.lastMove = { x: x, y: y }
    },
    mousedown(e, x, y) {
      var ship = Common.getShipAt(this.board, x, y)

      if (ship) {
        var offsetX = x - ship.x
        var offsetY = y - ship.y
        this.dragOffset = { x: offsetX, y: offsetY } // what part of the ship is being dragged

        bus.mouseIsDown = true

        this.mouseLandingPoint = { x, y }
        this.dragTarget = ship
        this.initialDragTargetPosition = { x: ship.x + 0, y: ship.y + 0 }
      } else {
        this.dragTarget = null
      }
    },
    moveShip(pos) {
      var ship = this.dragTarget
      var board = cloneDeep(this.board)
      board.ships.forEach((element) => {
        if (element.id == ship.id) {
          if (pos.x !== undefined) element.x = pos.x
          if (pos.y !== undefined) element.y = pos.y
          if (pos.direction !== undefined) element.direction = pos.direction
        }
      })

      if (Common.isBoardValid(board, 0)) {
        if (
          (ship.x != pos.x && pos.x !== undefined) ||
          (ship.y != pos.y && pos.y !== undefined)
        ) {
          this.targetMoved = true
        }
        if (pos.x !== undefined) ship.x = pos.x
        if (pos.y !== undefined) ship.y = pos.y
        if (pos.direction !== undefined) ship.direction = pos.direction
      }
    },
    mouseup(e, x, y) {
      var dragTarget = this.dragTarget
      if (!dragTarget) return
      if (bus.mouseIsDown && dragTarget != null) {
        if (!this.targetMoved) {
          // rotate ship, user just simply clicked
          this.moveShip({
            direction:
              dragTarget.direction == Common.SHIP_DIRECTION_HORIZONTAL
                ? Common.SHIP_DIRECTION_VERTICAL
                : Common.SHIP_DIRECTION_HORIZONTAL,
          })
        }
      }
      bus.mouseIsDown = false
      this.targetMoved = false
      this.dragTarget = null
    },
  },
  components: {
    PlacedShip,
  },
}
</script>