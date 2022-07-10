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
  <div>{{ name }}: {{ stats.gamesPlayed }}</div>
</template>
