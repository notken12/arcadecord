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
import bus from '@app/js/vue-event-bus'

import GameFlow from '@app/js/GameFlow'
import Common from '/gamecommons/chess'
import { replayAction } from '@app/js/client-framework'
//♙♘♗♖♕♔♟︎♞♝♜♛♚
export default {
  data() {
    return {
      selectedPiece: null,
    }
  },
  methods: {
    movePiece() {
      
    },
  },
  computed: {
    hint() {
      if (this.selectedPiece) {
        return 'Tap a square to move to'
      } else {
        return 'Tap a piece to select it'
      }
    },
    board: function () {
      return this.game.data.board
    },
    myColor() {
      let index = this.game.myIndex === -1 ? 1 : this.game.myIndex
      return this.game.data.colors[index]
    },
  },
  mounted() {
    this.$replayTurn(() => {
      replayAction(this.game, this.game.turns[this.game.turns.length - 1].actions[0])
      this.$endReplay(1000)
    })

    bus.on('piece-selected', (piece) => {
      this.selectedPiece = piece
    })
  },
  components: {
    Board
  }
}
</script>