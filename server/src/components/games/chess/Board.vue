<template>
  <div class="ratio vertical">
    <canvas width="9" height="9"></canvas>
    <div>
      <div class="ratio horizontal">
        <canvas width="9" height="9"></canvas>
        <div class="board">
          <div
            class="grid-container"
            :style="styles"
            @click.self="selectedPiece = null"
            ref="grid"
          >
            <transition-group name="fade">
              <div
                class="highlight"
                v-for="move in selectedPieceMoves"
                :key="move.to"
                :class="{ capture: move.capture }"
                :style="getHighlightStyles(move)"
              ></div>
              <div
                class="selected-square"
                v-for="square in selectedSquares"
                :key="square[0] + ',' + square[1]"
                :style="getSquareStyles(square)"
              ></div>
            </transition-group>

            <!-- 1-indexed -->
            <piece
              v-for="piece in board"
              :key="piece.id"
              :piece="piece"
              :selected="piece === selectedPiece"
              :incheck="
                isInCheck && piece.type === 'k' && piece.color === myColor
              "
              :moves="selectedPieceMoves"
            ></piece>

            <div
              class="highlight-click"
              v-for="move in selectedPieceMoves"
              :key="move.to"
              :style="getHighlightStyles(move)"
              @click="makeMove(move)"
            ></div>

            <transition name="fade">
              <promotion-menu
                v-if="promotionMenuOpen"
                :move="promotionMove"
              ></promotion-menu>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Piece from './Piece.vue'
import PromotionMenu from './PromotionMenu.vue'

import bus from '@app/js/vue-event-bus'
import Common from '/gamecommons/chess'

import gsap from 'gsap'

export default {
  data() {
    return {
      selectedPiece: null,
      promotionMenuOpen: false,
      promotionMove: null,
    }
  },
  computed: {
    board() {
      return this.game.data.board
    },
    myColor() {
      let index = this.game.myIndex === -1 ? 1 : this.game.myIndex
      return this.game.data.colors[index]
    },
    styles() {
      let transform = 'none'
      if (this.myColor === 1) {
        transform = 'rotate(180.001deg)'
      }
      return {
        transform,
      }
    },
    selectedPieceMoves() {
      if (!this.selectedPiece) {
        return []
      }
      return Common.getMoves(this.game, this.selectedPiece)
    },
    selectedSquares() {
      let squares = []
      if (this.selectedPiece) {
        squares.push([this.selectedPiece.file, this.selectedPiece.rank])
      }
      let previousMove =
        this.game.data.previousMoves[this.game.data.previousMoves.length - 1]
      if (previousMove) {
        squares.push([previousMove.to[0], previousMove.to[1]])
        squares.push([previousMove.from[0], previousMove.from[1]])
      }
      return squares
    },
    isInCheck() {
      let king = this.game.data.board.find(
        (piece) => piece.type === 'k' && piece.color === this.myColor
      )
      return Common.isInCheck(this.game, king)
    },
  },
  methods: {
    isCellDark(i) {
      // If the rank is odd, even cells are dark
      // If the rank is even, odd cells are dark
      if (Math.floor((i - 1) / 8) % 2 === 0) {
        return (i % 8) % 2 === 0
      } else {
        return (i % 8) % 2 === 1
      }
    },
    getHighlightStyles(move) {
      return {
        top: ((7 - move.to[1]) / 8) * 100 + '%',
        left: (move.to[0] / 8) * 100 + '%',
      }
    },
    getSquareStyles(square) {
      return {
        top: ((7 - square[1]) / 8) * 100 + '%',
        left: (square[0] / 8) * 100 + '%',
      }
    },
    promotePawn(move) {
      this.promotionMove = move
      this.promotionMenuOpen = true
    },
    makeMove(move) {
      if (this.selectedPiece.type === 'p') {
        let isPromotion =
          this.myColor === 0 ? move.to[1] === 7 : move.to[1] === 0
        if (isPromotion) {
          this.promotePawn(move)
          return
        }
      }
      this.$runAction('movePiece', { move: move, mog: 'mogsogdog' })
      this.$endAnimation(800)
      this.selectedPiece = null
    },
  },
  watch: {
    selectedPiece(piece) {
      bus.emit('piece-selected', piece)
    },
  },
  components: {
    Piece,
    PromotionMenu,
  },
  mounted() {
    bus.on('close-promotion-menu', () => {
      this.promotionMenuOpen = false
    })
    bus.on('deselect piece', () => {
      this.selectedPiece = null
    })
    bus.on('piece-pointer-down', (piece) => {
      if (piece.color === this.myColor) {
        this.selectedPiece = piece
      }
    })
    bus.on('piece-pointer-up', () => {
      this.selectedPiece = null
    })
    bus.on('make-move', (move) => {
      this.makeMove(move)
    })
  },
}
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;

.board {
  background-color: white;
  display: flex;
  box-shadow: theme.$md-elevation-level5;
  box-sizing: border-box;
}

.grid-container {
  background-image: url(/dist/assets/chess/board.svg);
  background-size: contain;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.highlight,
.highlight-click,
.selected-square {
  position: absolute;
  width: 12.5%;
  height: 12.5%;
  background-color: #0004ff4b;
}

.highlight-click {
  background: none;
  cursor: pointer;
}

.highlight {
  background: url('/dist/assets/chess/highlight.svg');
  background-size: contain;
}

.capture {
  background: url('/dist/assets/chess/capture.svg');
  background-size: contain;
}
</style>