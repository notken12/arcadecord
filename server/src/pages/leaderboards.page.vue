<script setup>
import Header from 'components/index/Header.vue';
import Content from 'components/index/Content.vue';
import Footer from 'components/index/Footer.vue';
import Button from 'components/index/Button.vue';
import LinkButton from 'components/index/LinkButton.vue';
import GameType from 'components/leaderboards/GameType.vue';
import UserRank from 'components/leaderboards/UserRank.vue';
import { computed, provide } from 'vue';

const props = defineProps({
  /** @type {import('vue').PropType<import('./leaderboards.page.server.js').Server>} */
  server: {
    type: Object,
    required: true,
  },
});

const gameTypes = {
  '4inarow': 'Four in a Row',
  '5letters': 'Five Letters',
  '8ball': '8 Ball',
  chess: 'Chess',
  cuppong: 'Cup Pong',
  filler: 'Filler',
  knockout: 'Knockout',
  seabattle: 'Sea Battle',
};

provide('server', props.server);

const sortedUsers = computed(() => {
  return [...props.server.stats.users]
    .map((e) => e[1])
    .slice()
    .sort((a, b) => b.gamesWon - a.gamesWon);
});
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
        <p>Total games played: {{ server.stats.gamesPlayed }}</p>
      </div>
      <div class="wrapper">
        <div style="width:100%;">
          <ul class="user-ranks">
            <UserRank v-for="(user, place) in sortedUsers" :user="user" :place="place + 1"/>
          </ul>
        </div>
        <ul class="game-types">
          <h3>Games played</h3>
          <GameType
            v-for="(name, typeId) in gameTypes"
            :typeId="typeId"
            :name="name"
          ></GameType>
        </ul>
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

.game-types {
  padding: 0;
  gap: 8px;
  display: flex;
  flex-direction: column;
}

h3 {
  margin: 0;
}
</style>

<style lang="scss">
@use 'scss/base/pages';

.content {
  align-items: flex-start;
  padding: 0 var(--padding-x);
}

.wrapper {
  display: flex;
  width:100%;
  gap: 32px;
  margin:16px 0;
}
.user-ranks {
  display: flex;
  width: auto;
  flex-direction: column;
  padding: 0;
  gap: 16px;
  margin: 0;
}
</style>
