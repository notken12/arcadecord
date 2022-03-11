<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <scores-view>
    </scores-view>

    <div class="middle">
      <game-canvas></game-canvas>
    </div>
  </game-view>
</template>

<script>

import 'scss/games/knockout.scss'
import GameCanvas from './GameCanvas.vue'

import Common from '/gamecommons/knockout'


export default {
  data() {
    return {}
  },
  components: {
    GameCanvas
  },
  mounted() {},
  methods: {},
}
</script>