<!--
  _error.page.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="top" v-if="isGameError">
    <div class="fabs">
      <button class="btn-fab" @click="openSettings">
        <i class="material-icons">settings</i>
      </button>
    </div>
  </div>

  <Settings v-if="settingsOpen"></Settings>
  <div class="error-text">{{ errorText }}</div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { GameConnectionError } from '../games/GameErrors.js';
import Settings from '@app/components/base-ui/Settings.vue';
import bus from '@app/js/vue-event-bus.js';
const pageContext = inject('pageContext');

const isGameError = ref(false);

const errorText = computed(() => {
  if (pageContext.errorInfo) {
    isGameError.value = true;
    switch (pageContext.errorInfo) {
      case GameConnectionError.DISCORD_USER_NOT_FOUND:
        return "¯\\_(ツ)_/¯ You aren't in this game's Discord server. Please join the server and try again.";
      case GameConnectionError.DISCORD_USER_UNAUTHORIZED:
        return 'You must have slash command permissions to play!';
      case GameConnectionError.GAME_FULL:
        return 'This game is full!';
      case GameConnectionError.GAME_NOT_FOUND:
        return '¯\\_(ツ)_/¯ Game not found';
      case GameConnectionError.USER_BANNED:
        // TODO: add link to help and feedback page
        return "¯\\_(ツ)_/¯ We're sorry, but you've been banned from Arcadecord. If you think this is a mistake, please contact us.";
      default:
        isGameError.value = false;
        return pageContext.errorInfo;
    }
  }
  if (pageContext.is404) {
    return 'Page not found';
  }
  return 'Something went wrong';
});

const settingsOpen = ref(false);

const openSettings = () => {
  settingsOpen.value = true;
};
const closeSettings = () => {
  settingsOpen.value = false;
};

onMounted(() => {
  bus.on('open-settings', openSettings);
  bus.on('close-settings', closeSettings);
});
</script>

<style lang="scss">
@use 'scss/base/theme' as theme;
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

body,
html,
#app {
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
  /*optional but incase it still doesn't work.*/
  min-width: 100%;
  min-height: 100%;
  /*further optional still incase elements case overflows*/
  max-width: 100%;
  max-height: 100%;
  background-color: theme.$md-sys-background;
  color: theme.$md-sys-on-background;
  font-family: theme.$md-sys-typescale-body1-font, sans-serif;
  font-size: theme.$md-sys-typescale-body1-size;
  user-select: none;
  box-sizing: border-box;
  display: flex;
  font-display: swap;
  overflow: hidden;
  /* position: absolute; */
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.error-text {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.top {
  width: 100%;
}

.fabs {
  justify-content: flex-end;
}
</style>
