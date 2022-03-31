<!--
  WordChooser.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import bus from '@app/js/vue-event-bus'
import { useAspectRatio } from '@app/components/base-ui/aspectRatio'
import Cell from './Cell.vue'
import { useFacade } from '@app/components/base-ui/facade'

const { $runAction } = useFacade()

const letters = reactive(['', '', '', '', ''])

const el = ref(null)

const getInsertionIndex = () => {
  let index = -1
  for (let i = 0; i < letters.length; i++) {
    if (letters[i] === '') {
      index = i
      break
    }
  }
  return index
}

const keyboardPress = (letter) => {
  const index = getInsertionIndex()
  if (index !== -1) {
    letters[index] = letter
  }
}

const keyboardBackspace = () => {
  let index = getInsertionIndex() - 1
  if (index === -2) {
    index = letters.length - 1
  }
  letters[index] = ''
}

const keyboardEnter = () => {
  const index = getInsertionIndex()
  if (index === -1) {
    $runAction('chooseWord', { word: letters.join('') })
  }
}

onMounted(() => {
  bus.on('keyboard:press', keyboardPress)
  bus.on('keyboard:backspace', keyboardBackspace)
  bus.on('keyboard:enter', keyboardEnter)
})

onUnmounted(() => {
  bus.off('keyboard:press', keyboardPress)
  bus.off('keyboard:backspace', keyboardBackspace)
  bus.off('keyboard:enter', keyboardEnter)
})
</script>

<template>
  <div class="board">
    <div class="row" ref="el">
      <Cell
        v-for="letter in letters.length"
        :letter="letters[letter - 1]"
        :key="letter"
      />
    </div>
  </div>
</template>
