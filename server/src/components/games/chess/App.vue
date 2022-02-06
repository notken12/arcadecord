<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->
    <!-- Don't create score badges because chess doesn't have scores  -->

    <div class="middle">
      <!-- Game UI just for chess  -->
      <board></board>
    </div>
  </game-view>
</template>
<script>
import '@app/scss/base/_theme.scss'
import '@app/scss/games/chess.scss'
import Board from './Board.vue'

import GameFlow from '@app/js/GameFlow'
import Common from '/gamecommons/chess'
import { replayAction } from '@app/js/client-framework'
//♙♘♗♖♕♔♟︎♞♝♜♛♚
export default {
  data() {
    return {
      selectedSquare: undefined,
      selectedSquareMoves: [],
    }
  },
  methods: {
    movePiece() {
      
    },
  },
  computed: {
    hint() {
      return ''
    },
    board: function () {
      return this.game.data.board
    },
    myColor() {
      let index = this.game.myIndex === -1 ? 1 : this.game.myIndex
      return this.game.data.colors[index]
    },
    isInCheck() {
      let king = this.board.find(
        (piece) => piece.type === 'k' && piece.color === this.myColor
      )
      return Common.isInCheck(this.board, king)
    },
  },
  mounted() {
    this.$replayTurn(() => {
      replayAction(this.game, this.game.turns[this.game.turns.length - 1].actions[0])
      this.$endReplay(1000)
    })
  },
  components: {
    Board
  }
}
</script>