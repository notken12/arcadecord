<template>
  <div class="piece" :class="classes" ref="el"></div>
</template>

<script>
import gsap from 'gsap'

function animatePiecePos() {
  let offsetLeft = (this.piece.column) * 100 + "%"
  let offsetTop = (5 - this.piece.row) * 100 + "%"

  gsap.fromTo(this.$refs.el, {
    y:'-150%',
    x:offsetLeft,
  }, {
    y: offsetTop,
    x: offsetLeft,
    duration: 0.17*(5-this.piece.row),
  })
}
function updatePiecePos(){
  let offsetLeft = (this.piece.column) * 100 + "%"
  let offsetTop = (5 - this.piece.row) * 100 + "%"

  gsap.to(this.$refs.el, {
      y:offsetTop,
      x: offsetLeft,
      duration: 0
  })
}

export default {
  data() {
    return {
      reversedRows: [5, 4, 3, 2, 1, 0]
    }
  },
  props: {
    piece: {
      type: Object,
      required: true
    }
  },
  computed: {
    classes() {
      if (this.piece.color === 0) return "yellow"
      return ""
    }
  },
  watch: {
    piece: {
      handler: updatePiecePos,
      deep: true,
    }
  },
  mounted() {
    animatePiecePos.call(this)
  }
}
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;
.piece {
  background-image: url("/dist/assets/4inarow/RedChecker.svg");
  background-size: auto 100%;
  cursor: pointer;
  position: absolute;
  left: 0.1%;
  top: 0%;
  width: 14.2857143%;
  height: 16.6666667%;
  box-sizing: border-box;
  z-index: 0;
}
.piece.yellow {
  background-image: url("/dist/assets/4inarow/YellowChecker.svg");
}
.selected {
  background-color: #ffffff88;
}
.incheck {
  background-color: #ff000088;
}
</style>
