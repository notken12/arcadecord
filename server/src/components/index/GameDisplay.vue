<script setup>
defineProps({
  game: String,
})
</script>

<template>
  <div class="game-display">
    <img :src="'/public/icons/' + game + '.svg'" :alt="game" width="64" />
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.game-display {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

img {
  filter: drop-shadow(0 2px 4px #00000099);
  border-radius: 10%;
}
</style>
