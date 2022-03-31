<!--
  Board.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useAspectRatio } from '@app/components/base-ui/aspectRatio'
import Cell from './Cell.vue'
import bus from '@app/js/vue-event-bus'
import { useFacade } from '@app/components/base-ui/facade'

const { $runAction, game } = useFacade()

const boardEl = ref(null)

const props = defineProps({
  guesses: {
    type: Array,
    required: true,
  },
  active: {
    type: Boolean,
    required: false,
  },
})

// 2d array of board guesses
const grid = reactive([])
for (let i = 0; i < 6; i++) {
  let row = []
  for (let i = 0; i < 5; i++) {
    row.push('')
  }
  grid.push(row)
}

const getInsertionRow = () => {
  return props.guesses.length
}

const getInsertionIndex = () => {
  let row = grid[getInsertionRow()]
  if (!row) {
    return -1
  }
  let index = -1
  for (let i = 0; i < row.length; i++) {
    if (row[i] === '') {
      index = i
      break
    }
  }
  return index
}

const keyboardPress = (letter) => {
  if (!props.active) return
  if (!game.value.data.answers[game.value.myIndex]) return
  const row = getInsertionRow()
  const index = getInsertionIndex()
  if (index !== -1 && row !== -1) {
    grid[row][index] = letter
  }
}

const keyboardBackspace = () => {
  if (!props.active) return
  if (!game.value.data.answers[game.value.myIndex]) return
  const row = getInsertionRow()
  let index = getInsertionIndex() - 1
  if (index === -2) {
    index = grid[row].length - 1
  }
  grid[row][index] = ''
}

const keyboardEnter = () => {
  if (!props.active) return
  if (!game.value.data.answers[game.value.myIndex]) return
  const rowIndex = getInsertionRow()
  const index = getInsertionIndex()
  if (index === -1 && rowIndex !== -1) {
    let row = grid[rowIndex]
    $runAction('guess', { word: row.join('') })
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
  <div class="board" ref="boardEl">
    <div v-for="row in grid" :key="grid.indexOf(row)" class="row">
      <Cell v-for="i in row.length" :letter="row[i - 1]" :key="i - 1" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$gap: 8px;
</style>
