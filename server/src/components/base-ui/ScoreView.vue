<template>
  <div class="container" v-if="!isMe || alwaysshow">
    <slot :player="player" :playerindex="playerindex"></slot>
  </div>
</template>

<script>
export default {
  props: ['player', 'playerindex', 'alwaysshow'],
  data() {
    return {}
  },
  computed: {
    isMe() {
      if (!this.player.discordUser) {
        return this.player.id === this.me.id
      }
      return this.player.discordUser.id === this.me.id
    },
  },
}
</script>