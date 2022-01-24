<template v-if="game">
  <div class="game-container">
    <game-header
      :game="game"
      :me="me"
      :hint="hint"
      :isitmyturn="isItMyTurn"
    ></game-header>
    <slot></slot>
    <waiting-view
      v-if="!isItMyTurn && !game.hasEnded && !sending"
    ></waiting-view>
    <result-view v-if="game.hasEnded" :game="game"></result-view>
    <sending-view v-if="!isItMyTurn && sending && !game.hasEnded"></sending-view>
    <game-manual-view v-if="manualOpen" :game="game"></game-manual-view>
  </div>
</template>

<script>
import bus from '@app/js/vue-event-bus.js'
import * as Client from '@app/js/client-framework.js'

import GameHeader from './GameHeader.vue'
import WaitingView from './WaitingView.vue'
import ResultView from './ResultView.vue'
import GameManualView from './GameManualView.vue'
import SendingView from './SendingView.vue'

export default {
  data() {
    return {
      manualOpen: false,
      isItMyTurn: false,
      sending: false,
      sendingAnimationLength: 500,
    }
  },
  props: ['game', 'me', 'hint'],
  components: {
    GameHeader,
    WaitingView,
    GameManualView,
    ResultView,
    SendingView,
  },
  mounted() {
    bus.on('open-manual', () => {
      this.manualOpen = true
    })
    bus.on('close-manual', () => {
      this.manualOpen = false
    })
    bus.on('sending', (sending) => {
      if (!sending) {
        navigator.vibrate ?? navigator.vibrate(100)
        setTimeout(() => {
          this.sending = false
        }, this.sendingAnimationLength)
      } else {
        this.sending = true
      }
    })
    this.isItMyTurn = this.game.isItMyTurn()
  },
  watch: {
    'game.turn': function (newTurn) {
      console.log('Turn changed to ' + newTurn)
      this.isItMyTurn = this.game.isItMyTurn()
    },
  },
}
</script>

<style lang="scss">
.game-container {
  display: flex;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  flex-direction: column;
  align-items: center;
}
</style>