<script setup>
defineProps({
  title: String,
});
</script>

<template>
  <div class="card">
    <div class="card-title">
      {{ title }}
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

.card {
  display: flex;
  flex-direction: column;
  background: theme.$md-sys-surface-variant;
  padding: 16px;
  gap: 16px;
  border-radius: 4px;
  box-shadow: theme.$md-elevation-level2;
}

.card-body {
  gap: 16px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 150%;
}
</style>
