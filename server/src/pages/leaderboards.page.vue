<script setup>
import Header from 'components/index/Header.vue';
import Content from 'components/index/Content.vue';
import Footer from 'components/index/Footer.vue';
import Button from 'components/index/Button.vue';
import LinkButton from 'components/index/LinkButton.vue';
import GameType from 'components/leaderboards/GameType.vue';
import { provide } from 'vue';

const props = defineProps({
  server: {
    type: Object,
    required: true,
  },
});

const gameTypes = [
  '4inarow',
  '5letters',
  '8ball',
  'chess',
  'cuppong',
  'filler',
  'knockout',
  'seabattle',
];

provide('server', props.server);
</script>

<template>
  <div class="container">
    <Header></Header>
    <Content>
      <h2>Server leaderboard</h2>
      <div class="server-header">
        <img
          :src="server.iconURL"
          alt="Server Icon"
          class="server-icon"
          width="40"
          height="40"
        />
        <h3>
          {{ server.name }}
        </h3>
      </div>
      <div class="overall">
        Total games played: {{ server.stats.gamesPlayed }}
      </div>
      <div class="game-types">
        <GameType v-for="typeId in gameTypes" :typeId="typeId"></GameType>
      </div>
    </Content>
    <Footer></Footer>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 100%;
  background: #1b1b1f;
}

.server-header {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.server-icon {
  border-radius: 100px;
}
</style>

<style lang="scss">
@use 'scss/base/pages';

.content {
  align-items: flex-start;
  padding: 0 var(--padding-x);
}
</style>
