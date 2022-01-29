<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->
    <scores-view>
      <template v-slot="scoreView">
        <score-badge :scoreview="scoreView"></score-badge>
      </template>
    </scores-view>
    <div class="middle">
      <board></board>
      <changer></changer>
    </div>
  </game-view>
</template>

<script>
import ScoreBadge from './ScoreBadge.vue'
import Board from './Board.vue'
import Changer from './Changer.vue'
import { replayAction } from '@app/js/client-framework.js'
import bus from '@app/js/vue-event-bus.js'
import store from '@app/js/store.js'
import Common from '/gamecommons/filler'


export default {
  data() {
    return {}
  },
  methods: {
    getBlobSize(playerIndex) {
      var blob = Common.Board.getPlayerBlob(this.game.data.board, playerIndex)
      return blob.length
    },
  },
  computed: {
    hint() {
      return 'Tap a color to switch to that color'
    },
  },
  components: {
    ScoreBadge,
    Board,
    Changer,
  },
  mounted() {
    // data is a local var that has the data that was transmitted
    this.$replayTurn(() => {
      replayAction(this.game, this.previousTurn.actions[0])
      this.$endReplay(750) // ms
    })
  },
  methods: {},
}
</script>