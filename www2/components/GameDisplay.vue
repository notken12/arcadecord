<!--
  GameDisplay.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
defineProps({
  game: String,
});
</script>

<template>
  <div class="game-display">
    <img :src="'/icons/' + game + '.svg'" :alt="game" width="64" height="64" />
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.game-display {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

img {
  filter: drop-shadow(0 2px 4px #00000099);
  border-radius: 10%;
}
</style>
