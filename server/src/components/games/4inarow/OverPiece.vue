<template>
  <div class="overThing" ref="el" :class="classes"></div>
</template>
<script>
import bus from '@app/js/vue-event-bus'
import gsap from 'gsap'

function movePiece() {
  let offsetLeft = (this.selectedColumn || 0) * 14.25 + '%'
  gsap.to(
    this.$refs.el,
    {
      left: offsetLeft,
      'margin-top': '-16%',
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
      let offsetLeft = (this.selectedColumn || 50) * 20 + '%'
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
  width: 14.2857143%;
  height: 16.6666667%;
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
