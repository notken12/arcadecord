<script>
export default {
  data() {
    return {
      promotionPieces: {
        n: '♞',
        b: '♝',
        r: '♜',
        q: '♛',
      },
    }
  },
}
</script>

<template>
  <div class="dialog-backdrop">
    <div class="dialog">
      <h1>Promote pawn</h1>

      <div
        class="promotion-piece"
        v-for="piece in promotionPieces"
        :key="piece"
      >
        {{ promotionPieces[piece] }}
      </div>
    </div>
  </div>
</template>