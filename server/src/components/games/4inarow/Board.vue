<template>
  <div class="ratio vertical">
    <canvas width="350" height="300"></canvas>
    <div>
      <div
        class="ratio horizontal"
        style="position: relative"
        @changeColumn="changeColumn($event)"
      >
        <canvas width="350" height="300"></canvas>
        <div class="board-front">
          <ColumnOverlay
            v-for="col in board.width"
            :selectedColumn="selectedColumn"
            :column="col - 1"
            :key="col"
          ></ColumnOverlay>
        </div>
        <div class="board-back">
          <TransitionGroup
            :css="false"
            @enter="animatePiece"
            @appear="updatePiecePos"
          >
            <Piece
              v-for="piece in board.pieces"
              :piece="piece"
              :data-row="piece.row"
              :data-column="piece.column"
              :key="`${piece.row},${piece.column}`"
            ></Piece>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
  <DropButton
    v-if="buttonShowing"
    :selectedColumn="selectedColumn"
  ></DropButton>
</template>

<script>
import gsap from 'gsap'

import Piece from './Piece.vue'
import DropButton from './DropButton.vue'
import ColumnOverlay from './ColumnOverlay.vue'
import OverPiece from './OverPiece.vue'

import GameFlow from '@app/js/GameFlow'
import Common from '/gamecommons/chess'
import bus from '@app/js/vue-event-bus'
export default {
  data() {
    return {
      selectedColumn: null,
    }
  },
  computed: {
    board() {
      return this.game.data.board
    },
    buttonShowing() {
      if (this.selectedColumn || this.selectedColumn === 0) return true
    },
  },
  mounted() {
    bus.on('changeColumn', (column) => {
      this.selectedColumn = column
    })
  },
  components: {
    Piece,
    DropButton,
    ColumnOverlay,
    OverPiece,
  },
  methods: {
    animatePiece(el, done) {
      let offsetLeft = el.dataset.column * 100 + '%'
      let offsetTop = (5 - el.dataset.row) * 100 + '%'

      gsap.fromTo(
        el,
        {
          y: '-150%',
          x: offsetLeft,
        },
        {
          y: offsetTop,
          x: offsetLeft,
          duration: 0.17 * (5 - el.dataset.row),
          onComplete: done,
        }
      )
    },
    updatePiecePos(el) {
      let offsetLeft = el.dataset.column * 100 + '%'
      let offsetTop = (5 - el.dataset.row) * 100 + '%'

      gsap.to(el, {
        y: offsetTop,
        x: offsetLeft,
        duration: 0,
        // onComplete: done
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;
.overUI {
  margin: auto;
}
.board-back {
  background-image: url(/dist/assets/4inarow/FullBack.svg);
  background-size: contain;
  position: absolute;
  width: 100%;
  height: 100%;
}
.board-front {
  cursor: pointer;
  background-image: url(/dist/assets/4inarow/FullFront.svg);
  background-size: contain;
  background-color: transparent;
  box-shadow: theme.$md-elevation-level5;
  box-sizing: border-box;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
}

.ratio.vertical,
.ratio.vertical > canvas {
  max-width: 500px;
}
</style>
