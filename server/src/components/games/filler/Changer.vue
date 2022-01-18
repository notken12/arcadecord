<template>
  <div class="changer">
    <changer-button
      v-for="colorId in colors.length"
      :key="colorId"
      :colorid="colorId - 1"
    ></changer-button>
  </div>
</template>

<script>
// FOR every COLOR in the COMMON COLORS, display a CHANGER BUTTON with its prop COLOR ID set to that COLOR
import ChangerButton from './ChangerButton.vue'
import Common from '/gamecommons/filler'

export default {
  data() {
    return {
      colors: Common.COLORS,
    }
  },
  components: {
    ChangerButton,
  },
}
</script>

<style lang="scss">
.changer {
  display: flex;
  flex-direction: row;
  gap: 16px;
}
</style>