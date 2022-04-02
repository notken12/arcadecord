<!--
  Keyboard.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import bus from '@app/js/vue-event-bus'
import layout from './Keyboard.layout.json'
import Key from './Key.vue'
import { useFacade } from '@app/components/base-ui/facade'
import GameFlow from '@app/js/GameFlow'

const { replaying, runningAction, game } = useFacade()

const props = defineProps({
  guesses: {
    type: Array,
    required: true,
  },
})

const hitEnter = () => {
  bus.emit('keyboard:enter')
}
const typeLetter = (l) => {
  bus.emit('keyboard:press', l)
}
const hitBackspace = () => {
  bus.emit('keyboard:backspace')
}

const alphabet = 'qwertyuiopasdfghjklzxcvbnm'

const eventListener = (e) => {
  if (
    replaying.value ||
    runningAction.value ||
    !GameFlow.isItMyTurn(game.value)
  ) {
    return
  }
  if (e.key === 'Enter') {
    hitEnter()
  } else if (e.key === 'Backspace') {
    hitBackspace()
  } else if (alphabet.includes(e.key)) {
    typeLetter(e.key)
  }
}

onMounted(() => {
  window.addEventListener('keydown', eventListener)
})

onUnmounted(() => {
  window.removeEventListener('keydown', eventListener)
})

const pressKey = (key) => {
  if (
    replaying.value ||
    runningAction.value ||
    !GameFlow.isItMyTurn(game.value)
  ) {
    return
  }
  if (key.key === 'enter') {
    hitEnter()
  } else if (key.key === 'backspace') {
    hitBackspace()
  } else if (alphabet.includes(key.key)) {
    typeLetter(key.key)
  }
}

const hints = computed(() => {
  let hints = {}
  for (let guess of props.guesses) {
    for (let i = 0; i < guess.word.length; i++) {
      if (
        guess.hints[i] > hints[guess.word[i]] ||
        hints[guess.word[i]] === undefined
      )
        hints[guess.word[i]] = guess.hints[i]
    }
  }
  return hints
})
</script>

<template>
  <div class="keyboard">
    <div v-for="row in layout.rows" class="kb-row">
      <Key
        v-for="key in row"
        :kbkey="key"
        :key="row.indexOf(key)"
        :hint="hints[key.key]"
        @press="pressKey($event)"
      ></Key>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$gap: 6px;

.keyboard {
  display: flex;
  flex-direction: column;
  gap: $gap;
  width: 100%;
  max-width: 500px;
}

.kb-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  // gap: $gap;
}
</style>
