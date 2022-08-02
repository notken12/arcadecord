<script setup lang="ts">
import { computed } from 'vue';
import { useFacade } from './facade';
import LobbyPlayer from './LobbyPlayer.vue';
import { setReady } from '../../js/client-framework';
import { useStore } from 'vuex';

const { game, me } = useFacade();

const myPlayer = computed(() =>
  game.value.players.find((p) => p.discordUser.id === me.value.id)
);

const isReady = computed(() => {
  return myPlayer.value?.ready;
});

const readyButtonText = computed(() => {
  return isReady.value ? 'Un-ready' : 'Ready';
});

const toggleReady = async () => {
  const result = await setReady(!isReady.value);
  if (result.success) {
    console.log('[arcadecord] successfully set ready status!');
  }
};

const store = useStore();
const kicked = computed(() => {
  return store.state.kicked;
});
</script>

<template>
  <div class="lobby-wrapper">
    <div v-if="!kicked">
      <h1>{{ game.name }} lobby</h1>
      <h3>{{ game.description }}</h3>
      <p>Waiting for players to join and ready up...</p>
      <ul class="players">
        <LobbyPlayer
          v-for="player in game.players"
          :player="player"
          :i-am-owner="game.myIndex === 0"
        />
      </ul>
      <div class="flex-center">
        <button @click="toggleReady">{{ readyButtonText }}</button>
      </div>
    </div>
    <div v-if="kicked">Sorry, you've been kicked from the game.</div>
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
  margin-bottom: 32px;
}
</style>
