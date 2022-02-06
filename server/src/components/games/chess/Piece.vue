<template>
  <div class="piece">
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
    styles() {
    }
  },
}
</script>

<style lang="scss" scoped>
.piece {
  position: absolute;
}
</style>