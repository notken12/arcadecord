<template>
  <div class="player" :class="classes" v-if="!isMe || alwaysshow">
    <img
      v-bind:src="avatarURL"
      class="player-image"
      alt="player"
      draggable="false"
    />
    <div class="player-name">
      <div v-if="!isMe">
        <span class="username">{{ showedPlayer.discordUser.username }}</span>
        <span class="discriminator"
          >#{{ showedPlayer.discordUser.discriminator }}</span
        >
      </div>
      <div v-else>
        <span class="username">You</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  props: ['player', 'alwaysshow'],
  computed: {
    avatarURL() {
      return (
        this.showedPlayer.discordUser.displayAvatarURL ||
        this.showedPlayer.discordUser.defaultAvatarURL
      )
    },
    isMe() {
      if (!this.player.discordUser) {
        return this.player.id === this.me.id
      }
      return this.player.discordUser.id === this.me.id
    },
    classes() {
      return {
        'player-me': this.isMe,
      }
    },
    showedPlayer() {
      if (this.isMe) {
        return {
          discordUser: this.me,
        }
      } else {
        return this.player
      }
    },
  },
}
</script>