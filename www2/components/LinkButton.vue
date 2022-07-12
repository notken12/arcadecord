<!--
  LinkButton.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
const props = defineProps({
  icon: String,
  outlined: Boolean,
  href: String,
})
</script>

<template>
  <a class="button" :href="href" :class="{ outlined }">
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
