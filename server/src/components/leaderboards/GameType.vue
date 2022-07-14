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
  <li>
    <img
      :src="'/icons/' + typeId + '.svg'"
      :alt="name"
      width="40"
      height="40"
    />
    <div>
      {{ name }}:&nbsp;<b>{{ stats.gamesPlayed }}</b>
    </div>
  </li>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

img {
  border-radius: 4px;
}

li {
  display: flex;
  padding: 16px;
  background: theme.$md-sys-surface-variant;
  border-radius: 6px;
  align-items: center;
  gap: 16px;
  width: 100%;
}
</style>
