<template>
  <div class="overThing" ref="el" :class="classes"></div>
</template>
<script>
import bus from '@app/js/vue-event-bus'
import gsap from 'gsap'

function movePiece() {
  let offsetLeft = (this.selectedColumn || 0) * 13.73 + '%'
  gsap.fromTo(
    this.$refs.el,
    {
      left: offsetLeft,
      'margin-top': '-5%',
    },
    {
      left: offsetLeft,
      'margin-top': '0%',
      duration: 0.3,
    }
  )
}
export default {
  props: {
    selectedColumn: {
      type: Number,
      default: null,
    },
  },
  computed: {
    styles() {
      let offsetLeft = (this.selectedColumn || 0) * 13.73 + '%'
      return {
        left: offsetLeft,
        'margin-top': '0px',
      }
    },
    classes() {
      if (Math.abs(this.game.myIndex) === 0 && this.selectedColumn != null)
        return 'selected yellow'
      if (this.selectedColumn != null) return 'selected'
      return ''
    },
  },
  mounted() {},
  watch: {
    selectedColumn: {
      handler: movePiece,
    },
  },
}
</script>
<style lang="scss">
@use 'scss/base/_theme' as theme;

.overThing {
  background-size: auto 100%;
  cursor: pointer;
  position: absolute;
  left: 0.1%;
  top: 0%;
  width: 13.6%;
  height: 13.6%;
  box-sizing: border-box;
  z-index: 1;
}
.overThing.selected {
  background-image: url('/dist/assets/4inarow/RedChecker.svg');
}
.overThing.selected.yellow {
  background-image: url('/dist/assets/4inarow/YellowChecker.svg');
}
</style>
