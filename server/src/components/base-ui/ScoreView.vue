<!--
  ScoreView.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="container" v-if="!isMe || alwaysshow">
    <slot :player="player" :playerindex="playerIndex"></slot>
  </div>
</template>

<script>
export default {
  props: ['player', 'playerindex', 'alwaysshow'],
  data() {
    return {};
  },
  computed: {
    isMe() {
      if (!this.player.discordUser) {
        return this.player.id === this.me.id;
      }
      return this.player.discordUser.id === this.me.id;
    },
    playerIndex() {
      if (this.playerindex === null || this.playerindex === undefined) {
        let myIndex = this.game.myIndex;
        if (myIndex === -1) myIndex = this.game.players.length;
        return myIndex;
      }
      return this.playerindex;
    },
  },
};
</script>
