<!--
  LinkButton.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup lang="ts">
const props = defineProps({
  icon: String,
  outlined: Boolean,
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
  <a class="button" :href="computedHref" :class="{ outlined }">
    <i class="material-icons" v-if="icon">{{ icon }}</i>
    <span>
      <slot></slot>
    </span>
  </a>
</template>
<style lang="scss" scoped>
@use '~/assets/css/base/button';

a {
  text-decoration: none;
}
</style>
