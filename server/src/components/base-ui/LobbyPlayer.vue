<script setup lang="ts">
import { computed } from 'vue';
import Player from '../../games/Player';

const props = defineProps<{ player: Player }>();

const readyText = computed(() => {
  return props.player.ready ? 'Ready' : 'Not ready';
});
</script>

<template>
  <div class="player-wrapper">
    <p class="player-name">
      {{ player.discordUser.tag }}
    </p>
    <p class="ready-text">{{ readyText }}</p>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

.player-wrapper {
  display: flex;
  flex-direction: row;
  background: theme.$md-sys-surface-variant;
  padding: 8px;
  border-radius: 4px;
}

p {
  margin: 4px;
}

.player-name {
  flex-grow: 1;
}

.ready-text {
  font-weight: bold;
  text-transform: uppercase;
}
</style>
