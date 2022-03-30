<!--  game.page.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.-->

<template>
  <GameComponent></GameComponent>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
const props = defineProps({
  gameType: {
    type: String,
    required: true,
  },
})

// const GameComponent = await import(`../components/games/${props.gameType}/App.vue`);

const GameComponent = defineAsyncComponent(() =>
  import(`../components/games/${props.gameType}/App.vue`)
)
</script>

<style lang="scss" src="scss/all-games.scss"></style>
