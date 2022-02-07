<template>
  <div class="piece" :style="styles" @click="selectPiece" :class="classes">
    {{ pieceIcons[piece.type] }}
  </div>
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

      let color = this.piece.color === 0 ? 'white' : 'black'
      let cursor = this.piece.color === this.myColor ? 'pointer' : 'default'

      return {
        transform,
        top,
        left,
        color,
        cursor,
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
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
    1px 1px 0 #000;
  transition: top 0.25s ease-in-out, left 0.25s ease-in-out;
}

.black {
  text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff,
    1px 1px 0 #fff;
}

.selected {
  background-color: #ffffff88;
}

.incheck {
  background-color: #ff000088;
}
</style>