<template>
  <div class="cell" :class="classes"></div>
</template>

<script>
import Common from '/gamecommons/filler'

export default {
  props: ['board', 'cell'],
  computed: {
    classes() {
      var COLORS = Common.COLORS
      var color = COLORS[this.cell.color] // this.cell is the number color id of the selected cell
      // color is a string containing the name of the desired color
      // mogo was here

      return [color] // an array with one string; the string is the color's name.
      // the class will be set to the color name
    },
  },
}
</script>

<style lang="scss">
$width: 40px;

.cell {
  width: $width;
  height: $width;
}
</style>