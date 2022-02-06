<template>
  <div class="grid-container">
    <!-- 1-indexed -->
    <div
      v-for="i in 64"
      :key="i"
      :class="{ darkCell: isCellDark(i) }"
      :title="i"
    ></div>
    <piece v-for="piece in board" :key="piece.id" :piece="piece"></piece>
  </div>
</template>

<script>
import Piece from './Piece.vue'

export default {
  data() {
    return {
      
    }
  },
  computed: {
    board() {
      return this.game.data.board
    },
    myColor() {
        let index = this.game.myIndex === -1 ? 1 : this.game.myIndex
        return this.game.data.colors[index]
    },
    styles() {
        let transform = 'none'
        if (this.myColor === 1) {
            transform = 'scale(1, -1)'
        }
        return {
            transform,
        }
    }
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
  components: {
    Piece,
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
  position: relative;
}

.darkCell {
  background-color: rgb(224, 199, 228);
}
</style>