<!--  ResultView.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.-->

<template>
  <transition name="fade" appear>
    <win-screen v-if="result === 'win'"></win-screen>
    <lose-screen v-else-if="result === 'lose'"></lose-screen>
    <draw-screen v-else-if="result === 'draw'"></draw-screen>
  </transition>
</template>

<script>
import WinScreen from './WinScreen.vue'
import LoseScreen from './LoseScreen.vue'
import DrawScreen from './DrawScreen.vue'

export default {
  data() {
    return {}
  },
  computed: {
    result() {
      if (this.game.winner === this.game.myIndex) {
        return 'win'
      } else if (this.game.winner === -1) {
        return 'draw'
      } else {
        return 'lose'
      }
    },
  },
  methods: {},
  mounted() {},
  components: {
    WinScreen,
    LoseScreen,
    DrawScreen,
  },
}
</script>
