<template>
  <div class="game-container">
    <slot></slot>
    <waiting-view v-if="!isItMyTurn && !game.hasEnded && !sending && !runningAction"></waiting-view>
    <result-view v-if="game.hasEnded && !replaying && !runningAction" :game="game"></result-view>
    <sending-view v-if="sending && !isItMyTurn && !game.hasEnded && !runningAction"></sending-view>
    <game-manual-view v-if="manualOpen" :game="game"></game-manual-view>
    <game-header :game="game" :me="me" :hint="hint" :isitmyturn="isItMyTurn"></game-header>

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
import GameFlow from '@app/js/GameFlow.js'

export default {
  data() {
    return {
      manualOpen: false,
      sending: false,
      sendingAnimationLength: 500,
    }
  },
  props: ['hint'],
  components: {
    GameHeader,
    WaitingView,
    GameManualView,
    ResultView,
    SendingView,
  },
  computed: {
    isItMyTurn() {
      return GameFlow.isItMyTurn(this.game) || this.replaying
    },
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
        setTimeout(() => {
          this.sending = false
        }, this.sendingAnimationLength)
      } else {
        this.sending = true
      }
    })
  },
  watch: {
    // 'game.turn': function (newTurn) {
    //   var player = this.game.players[newTurn]
    //   console.log(`[arcadecord] turn changed to ${newTurn}, it's now ${player.discordUser.tag}'s turn`)
    //   this.isItMyTurn = GameFlow.isItMyTurn(this.game) || this.replaying;
    // },
    // replaying: function (newValue) {
    //   this.isItMyTurn = GameFlow.isItMyTurn(this.game) || newValue;
    // },
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
  animation: fadein 0.5s;
  // position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>