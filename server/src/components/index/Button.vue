<!--
  Button.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
const props = defineProps({
  icon: String,
  outlined: Boolean,
})
</script>

<template>
  <button :class="{ outlined }">
    <i class="material-icons" v-if="icon">{{ icon }}</i>
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
@use 'scss/base/button'
</style>
