<!--
  ChangerButton.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div
    class="changer-button"
    :class="classes"
    v-on:click="changeBlob()"
    :disabled="isDisabled"
  ></div>
</template>
<script>
// Import client-framework.js, which you need to connect to the server
import * as Client from '@app/js/client-framework.js';

import bus from '@app/js/vue-event-bus.js';
import Common from '/gamecommons/filler';

import { runAction } from '@app/js/client-framework.js';
import GameFlow from '@app/js/GameFlow';

// Create a button that will set the player's blob to the target color
export default {
  props: ['colorid'],
  data() {
    return {};
  },
  methods: {
    changeBlob() {
      this.$runAction('switchColors', { targetColor: this.colorid }); // data contains the targetColor, which is the action data
      this.$endAnimation(1000);
    },
  },
  computed: {
    classes() {
      var COLORS = Common.COLORS;
      var color = COLORS[this.colorid]; // gets the color of 'this' button's target (stored as a prop called colorid) from common.
      // color is a string containing the name of the desired color

      let classes = [color];
      if (this.isDisabled) {
        classes.push('disabled');
      }

      return classes; // an array with one string; the string is the color's name.
      // the class will be set to the color name
    },
    isDisabled() {
      let myIndex = this.game.myIndex === -1 ? 1 : this.game.myIndex;
      var myColor = Common.Board.getPlayerColor(this.game.data.board, myIndex);
      let opponentIndex = myIndex ^ 1;

      var opponentColor = Common.Board.getPlayerColor(
        this.game.data.board,
        opponentIndex
      );
      return myColor === this.colorid || opponentColor === this.colorid;
    },
  },
};
</script>

<style lang="scss">
@use '../../../scss/base/_theme.scss' as theme;

.changer-button {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  box-shadow: theme.$md-elevation-level2;
  cursor: pointer;
  transition-property: width, height, opacity;
  transition-duration: 0.2s;
}

.changer-button.disabled {
  width: 20px;
  height: 20px;
  cursor: default;
  opacity: 0.7;
}
</style>
