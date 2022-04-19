<!--
  PlayerView.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="container" v-if="!isMe || alwaysshow">
    <div class="player" :class="classes">
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

    <div class="pointer">
      <transition name="fade">
        <div class="triangle" v-if="isPlayersTurn"></div>
      </transition>
    </div>
  </div>
</template>

<script>
import GameFlow from '@app/js/GameFlow.js';

export default {
  data() {
    return {};
  },
  props: ['player', 'playerindex', 'alwaysshow'],
  computed: {
    avatarURL() {
      let url =
        this.showedPlayer.discordUser.displayAvatarURL ||
        this.showedPlayer.discordUser.defaultAvatarURL;
      return `${url}?size=32`;
    },
    isMe() {
      if (!this.player.discordUser) {
        return this.player.id === this.me.id;
      }
      return this.player.discordUser.id === this.me.id;
    },
    classes() {
      return {
        'player-me': this.isMe,
      };
    },
    showedPlayer() {
      if (this.isMe) {
        return {
          discordUser: this.me,
        };
      } else {
        return this.player;
      }
    },
    isPlayersTurn() {
      if (!this.isMe)
        return GameFlow.isItUsersTurn(this.game, this.playerindex);
      return GameFlow.isItMyTurn(this.game);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../../scss/base/_theme.scss' as theme;

.pointer {
  height: 20px;
  padding-top: 8px;
}

.triangle {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;

  border-bottom: 6px solid black;

  animation: bounce 1s infinite;
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-4px);
  }
  50% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(0);
  }
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
}

.player {
  background-color: theme.$md-sys-surface-variant;
  color: white;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  box-shadow: theme.$md-elevation-level3;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  font-size: 0.8em;
}

.player img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  user-select: none;
}

.player-name span {
  display: block;
}

.player-name .discriminator {
  opacity: 0.7;
}

.player-me .username {
  font-weight: bold;
}
</style>
