<template>
  <div
    class="piece"
    :style="styles"
    @click="selectPiece"
    :class="classes"
    ref="pieceEl"
  ></div>
</template>

<script>
import gsap from 'gsap'

const animate = function () {
  let top = ((7 - this.piece.rank) / 1) * 100 + '%'
  let left = (this.piece.file / 1) * 100 + '%'

  gsap.to(this.$refs.pieceEl, {
    x: left,
    y: top,
    ease: 'power3.inOut',
    duration: 0.25,
    rotation: this.myColor === 1 ? 180 : 0,
  })
}

export default {
  props: ['piece', 'selected', 'incheck'],
  data() {
    return {
      pieceIcons: {
        p: '♟︎',
        r: '♜',
        n: '♞',
        b: '♝',
        q: '♛',
        k: '♚',
      },
    }
  },
  computed: {
    myColor() {
      let index = this.game.myIndex === -1 ? 1 : this.game.myIndex
      return this.game.data.colors[index]
    },
    styles() {
      let cursor = this.piece.color === this.myColor ? 'pointer' : 'default'

      let texturePositions = {
        p: 0,
        r: 1,
        n: 2,
        b: 3,
        q: 4,
        k: 5,
      }

      let backgroundPositionX =
        (texturePositions[this.piece.type] / 5) * 100 + '%'

      return {
        cursor,
        'background-position-x': backgroundPositionX,
      }
    },
    classes() {
      let classes = []
      if (this.piece.color === 1) {
        classes.push('black')
      }
      if (this.incheck) {
        classes.push('incheck')
      }
      return classes
    },
  },
  methods: {
    selectPiece() {
      if (this.piece.color === this.myColor)
        this.$parent.selectedPiece = this.piece
      else this.$parent.selectedPiece = null
    },
  },
  watch: {
    'piece.rank': {
      handler(newValue, oldValue) {
        animate.call(this)
      },
    },
    'piece.file': {
      handler(newValue, oldValue) {
        animate.call(this)
      },
    },
  },
  mounted() {
    let top = ((7 - this.piece.rank) / 1) * 100 + '%'
    let left = (this.piece.file / 1) * 100 + '%'

    gsap.set(this.$refs.pieceEl, {
      x: left,
      y: top,
      rotation: this.myColor === 1 ? 180 : 0,
    })
  },
}
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;

.piece {
  background-image: url('/dist/assets/chess/white_pieces.svg');
  background-size: auto 100%;
  cursor: pointer;
  overflow: hidden;
  position: absolute;
  left: 0;
  top: 0;
  touch-action: none;
  width: 12.5%;
  height: 12.5%;
  box-sizing: border-box;
}

.black {
  background-image: url('/dist/assets/chess/black_pieces.svg');
}

.selected {
  background-color: #ffffff88;
}

.incheck {
  background-color: #ff000088;
}
</style>