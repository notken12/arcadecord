<template>
  <div class="game-container">
    <game-header :game="game" :me="me" :hint="hint"></game-header>
    <slot></slot>
    <waiting-view v-if="!isItMyTurn && !game.hasEnded"></waiting-view>
    <result-view v-if="game.hasEnded" :game="game"></result-view>
    <game-manual-view v-if="manualOpen" :game="game"></game-manual-view>
  </div>
</template>

<script>
import bus from '@app/js/vue-event-bus.js';
import GameHeader from './GameHeader.vue'
import WaitingView from './WaitingView.vue'
import ResultView from './ResultView.vue'
import GameManualView from './GameManualView.vue'

export default {
  data() {
    return {
      manualOpen: false,
      isItMyTurn: false,
    }
  },
  props: ['game', 'me', 'hint'],
  components: {
    GameHeader,
    WaitingView,
    GameManualView,
    ResultView,
  },
  mounted() {
    bus.on('open-manual', () => {
      this.manualOpen = true
    })
    bus.on('close-manual', () => {
      this.manualOpen = false
    })
    this.isItMyTurn = this.game.isItMyTurn()
  },
  watch: {
    'game.turn': function (newTurn) {
      console.log('turn changed')
      this.isItMyTurn = this.game.isItMyTurn()
    },
  },
}
</script>