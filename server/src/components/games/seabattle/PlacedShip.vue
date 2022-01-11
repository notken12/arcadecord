<template>
  <div
    class="placed-ship"
    :style="styles"
    :x="ship.x"
    :y="ship.y"
    :class="classes"
  >
    <div class="placed-ship-bounding-box" :style="boundingBoxStyles"></div>
    <img draggable="false" :src="imageURL" class="placed-ship-image" />
  </div>
</template>

<script>
import bus from '@app/js/vue-event-bus'
import Common from '/gamecommons/seabattle'

export default {
  props: ['ship', 'board', 'selected'],
  data() {
    return {}
  },
  computed: {
    classes() {
      return this.selected ? 'selected' : ''
    },
    styles() {
      var board = this.board
      // position based on grid
      var ship = this.ship

      var transform = ''
      if (ship.direction == Common.SHIP_DIRECTION_VERTICAL) {
        transform = 'rotate(90deg)'
      }

      return {
        top: (ship.y / board.height) * 100 + '%',
        left: (ship.x / board.width) * 100 + '%',
        width: (ship.length / board.width) * 100 + '%',
        height: (1 / board.height) * 100 + '%',
        transform: transform,
        transformOrigin: (1 / ship.length) * 50 + '% 50%',
      }
    },
    boundingBox() {
      var ship = this.ship
      var x1 = ship.x - 1
      var y1 = ship.y - 1
      var x2 = ship.x + ship.length
      var y2 = ship.y + 1

      if (ship.direction == Common.SHIP_DIRECTION_VERTICAL) {
        x2 = ship.x + 1
        y2 = ship.y + ship.length
      }

      return { x1, y1, x2, y2 }
    },
    imgStyles() {
      var ship = this.ship

      var x = ship.x * Common.CELL_SIZE
      var y = ship.y * Common.CELL_SIZE
      var width = ship.length * Common.CELL_SIZE
      var height = Common.CELL_SIZE

      return {
        left: x + 'px',
        top: y + 'px',
        width: width + 'px',
        height: height + 'px',
      }
    },
    boundingBoxStyles() {
      var boundingBox = this.boundingBox
      var x = boundingBox.x1 * Common.CELL_SIZE
      var y = boundingBox.y1 * Common.CELL_SIZE
      var width = (boundingBox.x2 - boundingBox.x1 + 1) * Common.CELL_SIZE
      var height = (boundingBox.y2 - boundingBox.y1 + 1) * Common.CELL_SIZE
      return {
        left: x + 'px',
        top: y + 'px',
        width: width + 'px',
        height: height + 'px',
      }
    },

    imageURL() {
      var ship = this.ship
      var shipType = ship.type
      return '/dist/assets/seabattle/ships/' + shipType + '.png'
    },
  },
  methods: {
    mousedown(e) {
      var ship = this.ship

      bus.mouseIsDown = true

      var elPos = e.target.getBoundingClientRect()

      var x =
        elPos.x +
        Common.CELL_SIZE / 2 +
        Math.floor((e.clientX - elPos.x) / Common.CELL_SIZE) * Common.CELL_SIZE
      var y = elPos.y + Common.CELL_SIZE / 2

      if (ship.direction == Common.SHIP_DIRECTION_VERTICAL) {
        y =
          elPos.y +
          Common.CELL_SIZE / 2 +
          Math.floor((e.clientY - elPos.y) / Common.CELL_SIZE) *
            Common.CELL_SIZE
        x = elPos.x + Common.CELL_SIZE / 2
      }

      var bb = this.$el.getBoundingClientRect()

      // get nearest tile
      var nearestX = Math.floor((e.clientX - bb.left) / Common.CELL_SIZE) // nearest tile's x coordinate
      var nearestY = Math.floor((e.clientY - bb.top) / Common.CELL_SIZE)

      var offsetX = nearestX - this.ship.x
      var offsetY = nearestY - this.ship.y
      this.dragOffset = { x: offsetX, y: offsetY } // what part of the ship is being dragged

      this.mouseLandingPoint = { x, y }
      this.dragTarget = this
      this.initialDragTargetPosition = {
        x: this.ship.x + 0,
        y: this.ship.y + 0,
      }
    },
  },
}
</script>