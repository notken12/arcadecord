<script setup>
import { inject } from 'vue';

const props = defineProps({
  typeId: {
    type: String,
    required: true,
  },
});

const server = inject('server');

const stats = server.stats.games.get(props.typeId) || { gamesPlayed: 0 };
</script>

<template>
  <div>
    {{ stats.gamesPlayed }}
  </div>
</template>
