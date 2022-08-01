<script setup lang="ts">
import { computed } from 'vue';
import Player from '../../games/Player';
import { useFacade } from './facade';
import { setReady } from '../../js/client-framework';

const props = defineProps<{ player: Player }>();

const { me } = useFacade();

const isYou = computed(() => {
  return props.player.discordUser.id === me.value.id;
});

const playerName = computed(() => {
  if (isYou.value) return 'You';
  return props.player.discordUser.tag;
});

const readyText = computed(() => {
  return props.player.ready ? 'Ready' : 'Not ready';
});

const onClick = async () => {
  if (props.player.discordUser.id === me.value.id) {
    const result = await setReady(!props.player.ready);
    if (result.success) {
      console.log('[arcadecord] successfully set ready status!');
    }
  }
};
</script>

<template>
  <div class="player-wrapper" @click="onClick" :class="{ 'is-you': isYou }">
    <p class="player-name">
      {{ playerName }}
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

.is-you {
  cursor: pointer;

  .player-name {
    font-weight: bold;
  }
}
</style>
