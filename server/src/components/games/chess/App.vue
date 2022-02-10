<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->
    <!-- Using the scores-view component, create the color indicators -->
    <scores-view>
      <!-- Display a color indicator for each player -->
      <template v-slot="scoreView">
        <div class="color-indicator" :class="{black: game.data.colors[scoreView.playerindex] === 1}"></div>
      </template>
    </scores-view>

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
    movePiece() {},
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
      replayAction(
        this.game,
        this.game.turns[this.game.turns.length - 1].actions[0]
      )
      this.$endReplay(1000)
    })

    bus.on('piece-selected', (piece) => {
      this.selectedPiece = piece
    })
  },
  components: {
    Board,
  },
}
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;

.color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin: 0 5px;
  display: inline-block;
  background-color: #fff;
  border: 2px black solid;
  box-shadow: theme.$md-elevation-level3;
}

.color-indicator.black {
  background-color: #000;
  border-color: white;
}
</style>