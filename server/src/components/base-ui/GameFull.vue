<!--
  GameFull.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="game-full">
    <span>Game full</span>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

.game-full {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: theme.$md-sys-background;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
</style>
