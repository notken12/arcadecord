<template>
  <div class="over" v-on:click="changeColumnSelect"></div>
</template>
<script>
import bus from '@app/js/vue-event-bus'
export default {
  props: {
    selectedColumn: {
      type: Number,
      default: null
    },
    column: {
      type: Number,
      required: true
    }
  },
  computed: {
    styles() {
      let offsetLeft = (this.column) * 13.75 + "%"
      return {
        left: offsetLeft
      }
    }
  },
  methods: {
    changeColumnSelect() {
      bus.emit("changeColumn", this.column)
    }
  },
  mounted() {

  }
}
</script>
<style lang="scss">
@use 'scss/base/_theme' as theme;
.over {
  background-size: auto 100%;
  cursor: pointer;
  /* position: absolute; */
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  z-index: 3;
}
</style>
