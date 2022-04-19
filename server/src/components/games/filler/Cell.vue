<!--
  Cell.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div
    class="cell"
    :class="classes"
    @animationend="animated = false"
    ref="el"
  ></div>
</template>

<script>
import Common from '/gamecommons/filler';
import gsap from 'gsap';

export default {
  data() {
    return {
      animated: false,
    };
  },
  props: ['board', 'cell', 'isblob'],
  computed: {
    classes() {
      var COLORS = Common.COLORS;
      var color = COLORS[this.cell.color]; // this.cell is the number color id of the selected cell
      // color is a string containing the name of the desired color
      // mogo was here

      var classes = [color];

      if (this.isblob && !this.replaying) classes.push('partofblob');

      return classes; // an array with one string; the string is the color's name.
      // the class will be set to the color name
    },
  },
  watch: {
    'cell.color': function (newVal, oldVal) {
      // Play css animation when the color of the cell changes
      let tl = gsap.timeline();
      tl.to(this.$refs.el, {
        scale: 1.4,
        duration: 0.25,
      });
      tl.to(
        this.$refs.el,
        {
          scale: 1,
          duration: 0.25,
        },
        '<0.3'
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@use '../../../scss/base/_theme.scss' as theme;

.cell {
  width: 100%;
  height: 100%;
  transition: background-color 0.5s;
  border: none;
  outline: none;
}

.cell.partofblob {
  /* pulse animation */
  animation: pulse 1s infinite;
}

.animated {
  animation: pop 0.5s;
}

@keyframes pulse {
  /* brighten and darken the color */
  0% {
    filter: brightness(0.8);
  }
  50% {
    filter: brightness(1.2);
  }
  100% {
    filter: brightness(0.8);
  }
}
</style>
