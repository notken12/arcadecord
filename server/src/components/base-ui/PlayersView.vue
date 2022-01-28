<template>
  <div class="players-container">
    <player-view
      :key="me"
      :player="me"
      :alwaysshow="true"
    ></player-view>
    <player-view
      v-for="player in players"
      :key="player.discordUser.id"
      :player="player"
    ></player-view>
  </div>
</template>

<script>
import PlayerView from './PlayerView.vue';

export default {
  data() {
    return {}
  },
  computed: {
    players() {
      return this.game.players;
    }
  },
  components: {
    PlayerView,
  },
}
</script>