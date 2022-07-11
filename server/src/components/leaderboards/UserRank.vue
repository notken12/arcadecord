<script setup>
const props = defineProps({
  /** @type {import('vue').PropType<import('../../pages/leaderboards.page.server.js').User>} */
  user: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div>{{ user.tag }}: Games won: {{ user.gamesWon }} {{ user.id }}</div>
</template>
