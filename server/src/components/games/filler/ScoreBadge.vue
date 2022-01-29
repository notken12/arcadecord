<template>
  <div class="score" :class="playerColors[scoreview.playerindex]">
    <animated-number
      :number="blobSizes[scoreview.playerindex]"
      :decimals="0"
      :padzeroes="2"
    ></animated-number>
  </div>
</template>

<script>
import Common from '/gamecommons/filler'
import AnimatedNumber from 'components/base-ui/AnimatedNumber.vue'

export default {
  props: ['scoreview'],
  data() {
    return {}
  },
  computed: {
    blobSizes() {
      let sizes = []
      for (let i = 0; i < this.game.maxPlayers; i++) {
        var blob = Common.Board.getPlayerBlob(this.game.data.board, i)
        sizes.push(blob.length)
      }
      return sizes
    },
    playerColors() {
      let colors = []
      for (let i = 0; i < this.game.maxPlayers; i++) {
        var color = Common.Board.getPlayerColor(this.game.data.board, i)
        colors.push(Common.COLORS[color])
      }
      return colors
    },
  },
  components: {
    AnimatedNumber
  }
}
</script>