<template>
  <div class="piece" :style="styles">
    {{ pieceIcons[piece.type] }}
  </div>
</template>

<script>
export default {
  props: ['piece'],
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
        transform = 'scale(1, -1)'
      }
      let top = ((7 - this.piece.rank) / 8) * 100 + '%'
      let left = (this.piece.file / 8) * 100 + '%'

      let color = this.piece.color === 0 ? 'white' : 'black'
      let textShadow = this.piece.color === 0 ? '0 0 4px black' : 'none'
      return {
        transform,
        top,
        left,
        color,
        textShadow,
      }
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
}
</style>