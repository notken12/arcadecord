<!--
  ScoreBadge.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="score" :class="classes" @animationend="animated = false">
    <animated-number
      :number="blobSizes[scoreview.playerindex]"
      :decimals="0"
      :padzeroes="2"
    ></animated-number>
  </div>
</template>

<script>
import Common from '/gamecommons/filler';
import AnimatedNumber from 'components/base-ui/AnimatedNumber.vue';

export default {
  props: ['scoreview'],
  data() {
    return {
      animated: false,
    };
  },
  computed: {
    blobSizes() {
      let sizes = [];
      for (let i = 0; i < this.game.maxPlayers; i++) {
        var blob = Common.Board.getPlayerBlob(this.game.data.board, i);
        sizes.push(blob.length);
      }
      return sizes;
    },
    playerColors() {
      let colors = [];
      for (let i = 0; i < this.game.maxPlayers; i++) {
        var color = Common.Board.getPlayerColor(this.game.data.board, i);
        colors.push(Common.COLORS[color]);
      }
      return colors;
    },
    color() {
      return this.playerColors[this.scoreview.playerindex];
    },
    classes() {
      let classes = [this.color];
      if (this.animated) {
        classes.push('animated');
      }
      return classes;
    },
  },
  watch: {
    color() {
      this.animated = true;
    },
  },
  components: {
    AnimatedNumber,
  },
};
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme.scss' as theme;

.score {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  font-weight: bold;
  text-align: center;
  color: white;
  box-shadow: theme.$md-elevation-level3;
  border-radius: 4px;
  transition: background-color 0.5s;
}

.animated {
  animation: pop 0.5s;
}
</style>
