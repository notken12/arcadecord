<template>
  <div class="board">
    <div
      class="grid-container"
      :style="styles"
      @click.self="selectedPiece = null"
    >
      <transition-group name="fade">
        <div
          class="highlight"
          v-for="move in selectedPieceMoves"
          :key="move.to"
          :style="getHighlightStyles(move)"
        ></div>
      </transition-group>

      <!-- 1-indexed -->
      <piece
        v-for="piece in board"
        :key="piece.id"
        :piece="piece"
        :selected="piece === selectedPiece"
      ></piece>

      <div
        class="highlight-click"
        v-for="move in selectedPieceMoves"
        :key="move.to"
        :style="getHighlightStyles(move)"
        @click="makeMove(move)"
      ></div>
    </div>
  </div>
</template>

<script>
import Piece from './Piece.vue'
import bus from '@app/js/vue-event-bus'
import Common from '/gamecommons/chess'

export default {
  data() {
    return {
      selectedPiece: null,
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
        transform = 'rotate(180deg)'
      }
      return {
        transform,
      }
    },
    selectedPieceMoves() {
      if (!this.selectedPiece) {
        return []
      }
      return Common.getMoves(this.board, this.selectedPiece)
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
    makeMove(move) {
      this.$runAction('movePiece', { move: move })
    },
  },
  components: {
    Piece,
  },
  mounted() {},
}
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;

.board {
  background-color: white;
  display: flex;
  width: calc(100% - 32px);
  height: 0;
  max-width: 500px;
  max-height: 500px;
  padding-bottom: min(500px, calc(100% - 32px));
  box-shadow: theme.$md-elevation-level4;
}

.grid-container {
  height: 100%;
  width: 100%;
  display: flex;
  color: black;
  font-size: 50px;
  background-image: url('/dist/assets/chess/board.svg');
  position: relative;
  background-size: contain;
  padding-top: 100%;
}

.highlight,
.highlight-click {
  position: absolute;
  width: 12.5%;
  height: 12.5%;
  background-color: #0004ff4b;
}

.highlight-click {
  background: none;
  cursor: pointer;
}
</style>