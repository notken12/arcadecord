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
import Common from '/gamecommons/5letters'

const { $runAction, $endAnimation } = useFacade()

const letters = reactive(['', '', '', '', ''])

const board = ref(null)

useAspectRatio((parentWidth, parentHeight) => {
  const gap = 6
  const availWidth = parentWidth - gap * 4
  const availHeight = parentHeight
  const ratio = 5 / 1
  const parentRatio = availWidth / availHeight

  if (parentRatio > ratio) {
    // parent is wider than the aspect ratio
    return {
      width: availHeight * ratio + gap * 4,
      height: availHeight,
    }
  } else {
    // parent is taller than the aspect ratio
    return {
      width: availWidth + gap * 4,
      height: availWidth / ratio,
    }
  }
}, board)

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
  if (index === -1) {
    return
  }
  letters[index] = ''
}

const keyboardEnter = () => {
  const index = getInsertionIndex()
  let word = letters.join('')
  if (word.length < 5) {
    bus.emit('toast', 'Too short!')
    return
  } else if (word.length > 5) {
    bus.emit('toast', 'Too long!')
    return
  }

  if (Common.inWordList(word)) {
    $runAction('chooseWord', { word })
    $endAnimation(300)
  } else {
    bus.emit('toast', 'Not in word list')
    return
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
  <div class="board" ref="board">
    <div class="row" ref="board">
      <Cell
        v-for="i in letters.length"
        :cell="{ letter: letters[i - 1] }"
        :key="i - 1"
        :index="i - 1"
      />
    </div>
  </div>
</template>
