<!--
  Keyboard.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { onMounted } from 'vue'
import bus from '@app/js/vue-event-bus'
import layout from './Keyboard.layout.json'
import Key from './Key.vue'

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

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      hitEnter()
    } else if (e.key === 'Backspace') {
      hitBackspace()
    } else if (alphabet.includes(e.key)) {
      typeLetter(e.key)
    }
  })
})

const pressKey = (key) => {
  if (key.key === 'enter') {
    hitEnter()
  } else if (key.key === 'backspace') {
    hitBackspace()
  } else if (alphabet.includes(key.key)) {
    typeLetter(key.key)
  }
}

bus.on('submitWord', () => {
  hitEnter()
})
</script>

<template>
  <div class="keyboard">
    <div v-for="row in layout.rows" class="kb-row">
      <Key
        v-for="key in row"
        :kbkey="key"
        :key="row.indexOf(key)"
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
