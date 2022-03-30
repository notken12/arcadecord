<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <!-- Using the scores-view component, create the score badges -->
    <scores-view>
      <!-- Display a score badge for each player -->
      <template v-slot="scoreView">
        <score-badge :scoreview="scoreView"></score-badge>
      </template>
    </scores-view>

    <div class="middle">
      <!-- Game UI just for filler -->
      <Board></Board>
      <Changer></Changer>
    </div>
  </game-view>
</template>

<script>
// Import Vue components
import ScoreBadge from './ScoreBadge.vue'
import Board from './Board.vue'
import Changer from './Changer.vue'
// game-view, scores-view are automatically imported

// Import scss styles

import { replayAction } from '@app/js/client-framework.js'
import Common from '/gamecommons/filler'

// Export Vue component

// The properties this.game and this.me, and the $ functions
// are automatically injected by Arcadecord
// and available to use on all components

// ** See ChangerButton.vue for an example of how to run an action **

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
    // Define how turn replays should be handled
    this.$replayTurn(() => {
      // Replay opponent's first (and only) action, which is switching colors

      // In other games you would want to loop through all actions and
      // replay them at a given interval for the animations to play out
      replayAction(this.game, this.previousTurn.actions[0])

      // End the turn replay after 750 ms, which is how long the css animation takes
      this.$endReplay(750) // ms
    })
  },
  methods: {},
}
</script>

<style src="scss/games/filler.scss" lang="scss"></style>
