<!--
  Board.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { ref, reactive } from 'vue'
import { useAspectRatio } from '@app/components/base-ui/aspectRatio'
import Cell from './Cell.vue'

const boardEl = ref(null)

const props = defineProps({
  guesses: {
    type: Array,
    required: true,
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
