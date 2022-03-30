<!--
  Link.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
defineProps({
  href: String,
})
</script>

<template>
  <a :href="href"><slot></slot></a>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

a {
  font-family: Inter;
  color: theme.$color-light;
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: theme.$md-sys-primary;
  text-decoration: underline;
}
</style>
