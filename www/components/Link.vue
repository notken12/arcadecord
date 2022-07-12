<!--
  Link.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup lang="ts">
const props = defineProps({
  href: String,
  /** Whether to link to game server */
  gs: Boolean,
});

const { gameServerUrl } = useRuntimeConfig();

const computedHref = computed(() => {
  return props.gs ? `${gameServerUrl}${props.href}` : props.href;
});
</script>

<template>
  <a :href="computedHref">
    <slot></slot>
  </a>
</template>

<style lang="scss" scoped>
@use '~/assets/css/base/theme' as theme;

a {
  font-family: Work Sans;
  color: theme.$color-light;
  text-decoration: none;
  transition: color 0.2s;
  font-weight: bold;
}

a:hover {
  color: theme.$md-sys-primary;
  text-decoration: underline;
}
</style>
