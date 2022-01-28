<template>
  <div class="cell" :class="classes"></div>
</template>

<script>
import Common from '/gamecommons/filler'

export default {
  props: ['board', 'cell', 'isblob'],
  computed: {
    classes() {
      var COLORS = Common.COLORS
      var color = COLORS[this.cell.color] // this.cell is the number color id of the selected cell
      // color is a string containing the name of the desired color
      // mogo was here

      var classes = [color];

      if (this.isblob) {
        classes.push('partofblob');
      }

      return classes // an array with one string; the string is the color's name.
      // the class will be set to the color name
    }
  },
}
</script>

<style lang="scss" scoped>
@use '../../../scss/base/_theme.scss' as theme;

$width: 40px;

.cell {
  width: $width;
  height: $width;
  transition: background-color 0.5s;
}

.cell.partofblob {
  /* pulse animation */
  animation: pulse 1s infinite;
}

@keyframes pulse {
  /* brighten and darken the color */
  0% {
    filter: brightness(0.8);
  }
  50% {
    filter: brightness(1.5);
  }
  100% {
    filter: brightness(0.8);
  }
}
</style>