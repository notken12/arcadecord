<!--
  GameView.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="game-container">
    <waiting-view v-if="!isItMyTurn && !game.hasEnded && !sending && !runningAction"></waiting-view>
    <result-view v-if="game.hasEnded && !replaying && !runningAction" :game="game"></result-view>
    <sending-view v-if="sending && !isItMyTurn && !game.hasEnded && !runningAction"></sending-view>
    <game-manual-view v-if="manualOpen"></game-manual-view>
    <Settings v-if="settingsOpen"></Settings>
    <GameHeader :hint="hint"></GameHeader>
    <Transition name="fade">
      <FastForward v-if="replayingForAWhile"></FastForward>
    </Transition>
    <Transition name="fade">
      <GameFull v-if="contested"></GameFull>
    </Transition>
    <slot></slot>
  </div>
</template>

<script setup>
import bus from '@app/js/vue-event-bus.js'
import GameHeader from './GameHeader.vue'
import WaitingView from './WaitingView.vue'
import ResultView from './ResultView.vue'
import GameManualView from './GameManualView.vue'
import SendingView from './SendingView.vue'
import GameFlow from '@app/js/GameFlow.js'
import Settings from './Settings.vue'
import FastForward from './FastForward.vue'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useFacade } from './facade'
import GameFull from './GameFull.vue'

const props = defineProps({
  hint: String,
})

const { game, replaying, contested } = useFacade()

const manualOpen = ref(false)
const settingsOpen = ref(false)
const sending = ref(false)
const sendingAnimationLength = 500

const isItMyTurn = computed(() => {
  return GameFlow.isItMyTurn(game.value) || replaying.value
})

const openManual = () => {
  manualOpen.value = true
}
const closeManual = () => {
  manualOpen.value = false
}
const onSending = (s) => {
  if (!s) {
    setTimeout(() => {
      sending.value = false
    }, sendingAnimationLength)
  } else {
    sending.value = true
  }
}
const openSettings = () => {
  settingsOpen.value = true
}
const closeSettings = () => {
  settingsOpen.value = false
}

onMounted(() => {
  bus.on('open-manual', openManual)
  bus.on('close-manual', closeManual)
  bus.on('sending', onSending)
  bus.on('open-settings', openSettings)
  bus.on('close-settings', closeSettings)
})

onUnmounted(() => {
  bus.off('open-manual', openManual)
  bus.off('close-manual', closeManual)
  bus.off('sending', onSending)
  bus.off('open-settings', openSettings)
  bus.off('close-settings', closeSettings)
})

const replayingForAWhile = ref(false)

watch(
  replaying,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        if (replaying.value) {
          replayingForAWhile.value = true
        }
      }, 2000)
    } else {
      replayingForAWhile.value = false
    }
  },
  { immediate: true }
)
</script>

<style lang="scss">
.game-container {
  display: flex;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  flex-direction: column;
  align-items: flex-start;
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
