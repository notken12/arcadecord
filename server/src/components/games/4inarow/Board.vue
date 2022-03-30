<template>
  <div class="board-wrapper">
    <div class="board" ref="el">
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
          name="piecedrop"
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
        <Transition name="fade">
          <OverPiece
            v-if="selectedColumn !== null"
            :selectedColumn="selectedColumn"
          ></OverPiece
        ></Transition>
      </div>
    </div>
  </div>
  <div>
    <DropButton :selectedColumn="selectedColumn"></DropButton>
  </div>
</template>

<script setup>
import { useAspectRatio } from '@app/components/base-ui/aspectRatio'
import { ref } from 'vue'

const el = ref(null)
useAspectRatio(7 / 7.5, el)
</script>

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
          duration: 0.07 * (5 - el.dataset.row),
          onComplete: done,
          ease: 'power1.in',
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
.board-wrapper {
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
}

.board {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
}

.overUI {
  margin: auto;
}
.board-back {
  background-image: url(/assets/4inarow/FullBack.svg);
  background-size: contain;
  background-repeat: repeat;
  -webkit-filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
  width: 100%;
  height: 80%;
  position: absolute;
  bottom: 0;
}
.board-front {
  cursor: pointer;
  background-image: url(/assets/4inarow/CellFront.svg);
  background-size: 14.2857143% 16.6666667%;
  background-repeat: repeat;
  -webkit-filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
  box-shadow: theme.$md-elevation-level5;
  box-sizing: border-box;
  width: 100%;
  height: 80%;
  z-index: 1;
  display: flex;
  position: absolute;
  bottom: 0;
}

.piecedrop-enter-active {
  animation: fadeIn 0.1s linear;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
