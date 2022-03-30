<!--  AnimatedNumber.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.-->

<template>
  <span>{{ animatedNumber }}</span>
</template>

<script>
import gsap from 'gsap'

export default {
  props: ['number', 'decimals', 'padzeroes'],
  data() {
    return {
      tweenedNumber: this.number + 0,
    }
  },
  computed: {
    animatedNumber() {
      let number = this.tweenedNumber.toFixed(this.decimals || 0)
      if (this.padzeroes) {
        number = number.padStart(this.padzeroes, '0')
      }
      return number
    },
  },
  watch: {
    number(newValue) {
      gsap.to(this.$data, { duration: 0.5, tweenedNumber: newValue })
    },
  },
}
</script>
