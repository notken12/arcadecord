<template>
  <div class="button" v-on:click="placePiece">Go</div>
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
<style type="scss">
@use 'scss/base/_theme' as theme;

.button {
  color: black;
  position: absolute;
  bottom: 6%;
  padding: 1%;
  margin-left: auto;
  margin-right: auto;
  background-color: lightskyblue;
  cursor: pointer;
  border-radius: 10%;
}
</style>
