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
