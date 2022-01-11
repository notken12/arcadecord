<template>
  <div class="players-container">
    <player-view
      :key="me"
      :player="me"
      :me="me"
      :alwaysshow="true"
    ></player-view>
    <player-view
      v-for="player in players"
      :key="player.discordUser.id"
      :player="player"
      :me="me"
    ></player-view>
  </div>
</template>

<script>
import PlayerView from './PlayerView.vue';

export default {
  data() {
    return {}
  },
  props: ['players', 'me'],
  components: {
    PlayerView,
  },
}
</script>