<!--
  PlayersView.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="players-container">
    <player-view :key="me" :player="me" :alwaysshow="true"></player-view>
    <player-view
      v-for="player in players"
      :key="player.discordUser.id"
      :player="player"
      :playerindex="players.indexOf(player)"
    ></player-view>
  </div>
</template>

<script>
import PlayerView from './PlayerView.vue';

export default {
  data() {
    return {};
  },
  computed: {
    players() {
      return this.game.players;
    },
  },
  components: {
    PlayerView,
  },
};
</script>

<style lang="scss" scoped>
.players-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: calc(100% - 32px);
  height: 100%;
  overflow: visible;
  gap: 8px;
  flex-wrap: nowrap;
  z-index: 99;
}
</style>
