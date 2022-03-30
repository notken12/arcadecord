<!--  Cup.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.-->

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cup: {
    type: Object,
    required: true,
  },
  side: {
    type: Object,
    required: true,
  },
})

// Red cups: positive z
// Blue cups: negative z

const radius = 4.6 // cm
const tableEndMargin = 3.5 // cm
const cupMargin = 0.2 // cm
const tableLength = 243.84 // cm

const backOfTable =
  props.cup.color === 'red'
    ? tableLength / 2 + -tableEndMargin - radius
    : -tableLength / 2 + tableEndMargin + radius
const offsetZ =
  props.cup.color === 'red'
    ? 2 * radius * Math.cos(Math.PI / 6) * -1
    : 2 * radius * Math.cos(Math.PI / 6)
const offset = props.cup.color === 'red' ? -radius * 2 : radius * 2
const cupMarginOffset = props.cup.color === 'red' ? -cupMargin : cupMargin

const position = computed(() => {
  const oddRow = props.cup.row % 2 === 1
  let x = props.cup.rowPos * offset
  let z = backOfTable + props.cup.rowNum * offsetZ
  const y = 0
  return { x, y, z }
})
</script>

<template>
  <GltfModel
    src="/assets/cuppong/cup.glb"
    :scale="{ x: 100, y: 100, z: 100 }"
    :position="position"
  ></GltfModel>
</template>
