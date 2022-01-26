<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->
    <div class="middle">
      <board :board="game.data.board"></board>
      <changer></changer>
    </div>
  </game-view>
</template>

<script>
import Board from './Board.vue'
import Changer from './Changer.vue'
import { runAction } from '@app/js/client-framework.js'
import bus from '@app/js/vue-event-bus.js'
import store from '@app/js/store.js'

export default {
  data() {
    return {
      game: store.state.game,
      me: store.state.me,
      board: store.state.game.data.board,
    }
  },
  computed: {
    hint() {
      return 'Tap a color to switch to that color'
    },
  },
  components: {
    Board,
    Changer,
  },
  mounted() {
    // data is a local var that has the data that was transmitted
  },
}
</script>