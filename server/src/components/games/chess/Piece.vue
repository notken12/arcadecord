<template>
  <div class="piece" :style="styles" @click="selectPiece" :class="classes"></div>
</template>

<script>
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
      let transform = 'none'
      if (this.myColor === 1) {
        transform = 'rotate(180deg)'
      }
      let top = ((7 - this.piece.rank) / 8) * 100 + '%'
      let left = (this.piece.file / 8) * 100 + '%'

      let cursor = this.piece.color === this.myColor ? 'pointer' : 'default'

      let texturePositions = {
        p: 0,
        r: 1,
        n: 2,
        b: 3,
        q: 4,
        k: 5,
      }

      let backgroundPositionX = (texturePositions[this.piece.type] / 6) * -100 + '%'

      return {
        transform,
        top,
        left,
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
}
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;

.piece {
  position: absolute;
  width: 12.5%;
  height: 12.5%;
  cursor: pointer;
  text-align: center;
  transition: top 0.25s ease-in-out, left 0.25s ease-in-out;
  background-image: url('/dist/assets/chess/white_pieces.svg');
  background-size: auto 100%;
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