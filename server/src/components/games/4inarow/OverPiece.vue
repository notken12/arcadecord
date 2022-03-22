<template>
  <div class="overThing" ref="el" :class="classes"></div>
</template>
<script>
import bus from '@app/js/vue-event-bus'
import gsap from 'gsap'

function movePiece() {
  let offsetLeft = (this.selectedColumn || 0) * 100 + '%'
  gsap.to(this.$refs.el, {
    x: offsetLeft,
    y: '-150%',
    duration: 0.2,
  })
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
  mounted() {
    let offsetLeft = (this.selectedColumn || 0) * 100 + '%'
    gsap.to(this.$refs.el, {
      x: offsetLeft,
      y: '-150%',
      duration: 0,
    })
  },
  watch: {
    selectedColumn: {
      handler: movePiece,
    },
  },
}
</script>
<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;

.overThing {
  background-size: auto 100%;
  cursor: pointer;
  position: absolute;
  left: 0%;
  top: 0%;
  width: 14.2857143%;
  height: 16.6666667%;
  box-sizing: border-box;
  z-index: 1;
  -webkit-filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
  /* animation: pulse 1s infinite; */
  /* opacity: 0.7; */
}
.overThing.selected {
  background-image: url('/assets/4inarow/RedChecker.svg');
}
.overThing.selected.yellow {
  background-image: url('/assets/4inarow/YellowChecker.svg');
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
</style>
