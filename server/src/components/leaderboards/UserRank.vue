<script setup>
import { computed } from '@vue/runtime-core';

const props = defineProps({
  /** @type {import('vue').PropType<import('../../pages/leaderboards.page.server.js').User>} */
  user: {
    type: Object,
    required: true,
  },
  place: {
    type: Number,
    required: true,
  }
});
const top3 = computed(()=> {
  if (props.place === 1) return '🥇'; 
  if (props.place === 2) return '🥈'; 
  if (props.place === 3) return '🥉'; 
  else return props.place;
})
</script>

<template>
  <li>
    <div class="place">
      {{top3}}
      </div>
    <img
      :src="`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=128`"
      width="40"
      height="40"
      alt="stop being blind"
    />
    <div>{{ user.tag }} <br> Games won: {{ user.gamesWon }} <br> Games played: {{ user.gamesPlayed }}</div>
  </li>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

li {
  display:flex;
  width:max-content;
  gap:16px;
  border-radius:8px;
  align-content: center;
  padding:8px;
  background: theme.$md-sys-surface-variant;
}

img {
  border-radius:100%;
}
place {}
</style>
