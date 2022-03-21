<script setup>
const props = defineProps({
  icon: String,
  outlined: Boolean,
})
</script>

<template>
  <button :class="{ outlined }">
    <i class="material-icons" v-if="icon">{{ icon }}</i>
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

button {
  color: theme.$md-sys-on-primary;
  background-color: theme.$md-sys-primary;
  padding: 0px 24px;
  border: none;
  cursor: pointer;
  border-radius: 500px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  overflow: hidden;
  height: 40px;
  user-select: none;
  outline: none;
  box-sizing: border-box;
  min-width: 64px;
  font-size: theme.$md-sys-typescale-button-size;
  line-height: theme.$md-sys-typescale-button-line-height;
  font-family: theme.$md-sys-typescale-button-font;
  box-shadow: theme.$md-elevation-level1;
  font-weight: theme.$md-sys-typescale-button-weight;
  max-height: 36px;
  text-decoration: none;
  gap: 8px;
  transition: background-color 0.2s, box-shadow 0.2s;
  width: max-content;

  .material-icons {
    font-size: 18px;
    margin-left: -8px;
  }
}

button:disabled {
  box-shadow: theme.$md-elevation-level0;
  background-color: theme.$md-sys-on-surface;
  opacity: 12%;
  color: theme.$md-sys-on-surface;
}

button:hover {
  box-shadow: theme.$md-elevation-level2;
}

button:focus {
  box-shadow: theme.$md-elevation-level1;
}

button:active {
  box-shadow: theme.$md-elevation-level1;
}

.outlined {
  background: transparent;
  border: 1px #999 solid;
  box-shadow: none !important;
  color: theme.$md-sys-on-primary-container;
}

.outlined:hover {
  background: #0099ff44;
}
</style>
