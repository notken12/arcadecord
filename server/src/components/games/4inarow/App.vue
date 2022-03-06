<template>
  <!-- GameView component, contains all basic game UI
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->
    <board></board>
    <!-- Using the scores-view component, create the score badges -->
  </game-view>
</template>
<script>
  import Board from './Board.vue'
  import GameFlow from '@app/js/GameFlow'
  import Common from '/gamecommons/4inarow'
  import { replayAction } from '@app/js/client-framework'
  export default {
    computed: {
      hint() {
        return 'Select a column to drop your piece in'
      }
    },
    board() {
      return this.game.data.board
    },
    mounted() {
      this.$replayTurn(() => {
        replayAction(
          this.game,
          this.game.turns[this.game.turns.length - 1].actions[0]
        )
        this.$endReplay(1000)
      })
    },
    components: {
      Board
    }
  }
</script>
<style lang="scss">
@use 'scss/base/_theme' as theme;
@use 'scss/games/4inarow.scss' as ccs;

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
