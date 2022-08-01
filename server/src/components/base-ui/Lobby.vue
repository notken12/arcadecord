<script setup>
import { useFacade } from './facade';
import LobbyPlayer from './LobbyPlayer.vue';

const { game } = useFacade();
</script>

<template>
  <div class="lobby-wrapper">
    <ul class="players">
      <LobbyPlayer v-for="player in game.players" :player="player" />
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.lobby-wrapper {
  padding: 16px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.players {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
}
</style>
