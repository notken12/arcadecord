<template>
  <div class="grid-container">
    <!-- 1-indexed -->
    <div
      v-for="i in 64"
      :key="i"
      :class="{ darkCell: isCellDark(i) }"
      :title="i"
    ></div>
  </div>
</template>

<script>
let pieceIcons = {
  p: '♟︎',
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
}

export default {
  computed: {
    board() {
      return this.game.data.board
    },
  },
  methods: {
    isCellDark(i) {
      // If the rank is odd, even cells are dark
      // If the rank is even, odd cells are dark
      if (Math.floor((i - 1) / 8) % 2 === 0) {
        return (i % 8) % 2 === 0
      } else {
        return (i % 8) % 2 === 1
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.selected-square {
  background-color: aquamarine;
}

.grid-container {
  display: grid;
  background-color: white;
  grid-gap: 0px;
  grid-template-columns: 80px 80px 80px 80px 80px 80px 80px 80px;
  grid-template-rows: 80px 80px 80px 80px 80px 80px 80px 80px;
  text-align: center;
  font-size: 50px;
  color: black;
}

.darkCell {
  background-color: rgb(224, 199, 228);
}
</style>