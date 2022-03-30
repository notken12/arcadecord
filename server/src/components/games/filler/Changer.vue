<!--
  Changer.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="changer" :class="{ hidden }">
    <changer-button
      v-for="colorId in colors.length"
      :key="colorId"
      :colorid="colorId - 1"
    ></changer-button>
  </div>
</template>

<script>
// FOR every COLOR in the COMMON COLORS, display a CHANGER BUTTON with its prop COLOR ID set to that COLOR
import ChangerButton from './ChangerButton.vue'
import Common from '/gamecommons/filler'
import GameFlow from '@app/js/GameFlow'

export default {
  data() {
    return {
      colors: Common.COLORS,
    }
  },
  computed: {
    hidden() {
      return !GameFlow.isItMyTurn(this.game)
    },
  },
  components: {
    ChangerButton,
  },
}
</script>

<style lang="scss">
.changer {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transition-delay: 0.3s;
}

.hidden {
  transform: scale(0);
  opacity: 0;
}

@keyframes popOut {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
