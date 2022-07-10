<script setup>
import { inject, onMounted } from 'vue';

const props = defineProps({
  typeId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const server = inject('server');

const stats = server.stats.games[props.typeId] || { gamesPlayed: 0 };
</script>

<template>
  <li>{{ name }}: {{ stats.gamesPlayed }}</li>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

li {
  list-decoration: none;
  display: flex;
  padding: 16px;
  background: theme.$md-sys-surface-variant;
  border-radius: 4px;
}
</style>
