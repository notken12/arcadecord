<template>
  <div class="scores">
    <score-view :key="me" :player="me" :alwaysshow="true">
      <slot :player="me" :playerindex="myIndex"></slot>
    </score-view>
    <score-view
      v-for="player in players"
      :key="player.discordUser.id"
      :player="player"
      :playerindex="players.indexOf(player)"
    >
      <slot :player="player" :playerindex="players.indexOf(player)"></slot>
    </score-view>
  </div>
</template>

<script>
import ScoreView from './ScoreView.vue'

export default {
  data() {
    return {}
  },
  computed: {
    players() {
      return this.game.players
    },
    myIndex() {
      if (this.game.myIndex === -1) return this.game.players.length
      return this.game.myIndex
    },
  },
  components: {
    ScoreView,
  },
}
</script>

<style lang="scss" scoped>
.scores {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: calc(100% - 32px);
  overflow: visible;
  gap: 8px;
  flex-wrap: nowrap;
}
</style>
