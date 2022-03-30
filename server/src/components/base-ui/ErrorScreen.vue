<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: ['error'],
})
</script>

<template>
  <div class="container">
    <h2>Error</h2>
    <p class="error-text">{{ error }}</p>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/_theme.scss' as theme;

.container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: theme.$md-sys-background;
  color: theme.$md-sys-on-background;
  font-family: theme.$md-sys-typescale-body1-font, sans-serif;
  font-size: theme.$md-sys-typescale-body1-size;
  flex-direction: column;
}

p {
  margin: 0;
}
</style>
