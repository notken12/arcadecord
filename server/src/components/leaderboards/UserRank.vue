<script setup lang="ts">
import { User } from '@app/pages/leaderboards.page.server.js';
import { computed } from '@vue/runtime-core';

const props = defineProps<{ user: User; place: number }>();
const top3 = computed(() => {
  if (props.place === 1) return '🥇';
  if (props.place === 2) return '🥈';
  if (props.place === 3) return '🥉';
  else return props.place;
});
</script>

<template>
  <li>
    <div class="user">
      <div class="place">
        {{ top3 }}
      </div>
      <img :src="`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.webp?size=128`" width="40"
        height="40" alt="Profile picture" />
      <p class="name">{{ user.tag }}</p>
    </div>
    <div class="stats">
      <div class="stat">
        <p class="stat-title">Games won</p>
        <p class="stat-value">🏆 {{ user.gamesWon }}</p>
      </div>
      <div class="stat">
        <p class="stat-title">Games played</p>
        <p class="stat-value">{{ user.gamesPlayed }}</p>
      </div>
    </div>
  </li>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

li {
  display: flex;
  width: 100%;
  gap: 0px;
  border-radius: 6px;
  padding: 16px 16px;
  background: theme.$md-sys-surface-variant;
  flex-wrap: wrap;
}

li>div {
  display: flex;
  gap: 16px;
  align-items: center;
}

img {
  border-radius: 100%;
}

.user {
  flex-grow: 1;
}

.name {
  font-weight: bold;
  font-size: 1.2em;
  font-family: 'Work Sans', sans-serif;
  flex-grow: 1;
}

.place {
  font-size: 1.5em;
  width: 24px;
  text-align: center;
  font-weight: bold;
  font-family: 'Work Sans', sans-serif;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-title {
  opacity: 0.8;
  font-size: 0.9em;
  font-family: 'Work Sans', sans-serif;
}

.stat-value {
  font-weight: bold;
  color: #ffffff;
  font-size: 1.2em;
}
</style>
