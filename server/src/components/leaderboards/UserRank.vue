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
<img :src="'https://cdn.discordapp.com/avatars/' + user.div + '/' + user.avatar + '.webp?size=100'" alt="">
  <div>{{ user.tag }}: Games won: {{ user.gamesWon }}</div>
</template>

<style></style>
