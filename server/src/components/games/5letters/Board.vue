<script setup>
import { useAspectRatio } from '@app/components/base-ui/aspectRatio'

const boardEl = ref(null)

useAspectRatio(boardEl)

const props = defineProps({
  guesses: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="board"></div>
</template>
