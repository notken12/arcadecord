<template>
  <button v-on:click="placePiece" :class="{ hidden: selectedColumn === null }">
    Go
  </button>
</template>

<script>
import GameFlow from '@app/js/GameFlow'
import bus from '@app/js/vue-event-bus'
export default {
  props: {
    selectedColumn: {
      type: Number,
      default: null,
    },
  },
  methods: {
    placePiece() {
      this.$runAction('place', { col: this.selectedColumn })
      bus.emit('changeColumn', null)
    },
  },
}
</script>
<style lang="scss">
@use 'scss/base/_theme' as theme;

.hidden {
  opacity: 0;
  pointer-events: none;
}
</style>
