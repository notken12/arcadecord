<!--
  HitBoardCell.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div
    class="hit-board-cell"
    :style="cellStyles"
    @click="cellClicked"
    @animationend="animation = 'none'"
  ></div>
</template>

<script>
import Common from '/gamecommons/seabattle';
import GameFlow from '@app/js/GameFlow.js';
import bus from '@app/js/vue-event-bus';

export default {
  data() {
    return {
      animation: 'none',
    };
  },
  props: ['cell', 'board'],
  computed: {
    cellStyles() {
      let board = this.board;
      board.ships = board.revealedShips;

      let show = true;
      if (Common.getShipAt(this.board, this.cell.col, this.cell.row)) {
        show = false;
      }

      return {
        'background-image':
          show && this.cell.state !== Common.CELL_STATE_EMPTY
            ? 'url(' + this.imgURL + ')'
            : 'none',
        animation: this.animation,
      };
    },
    imgURL() {
      return '/assets/seabattle/cell-states/' + this.cell.state + '.svg';
    },
  },
  methods: {
    cellClicked() {
      if (
        this.cell.state === Common.CELL_STATE_EMPTY &&
        GameFlow.isItMyTurn(this.game)
      ) {
        bus.emit('changeCellect', this.cell);
      }
    },
    altText: function () {
      switch (this.cell.state) {
        case Common.CELL_STATE_HIT:
          return 'Hit';
        case Common.CELL_STATE_MISS:
          return 'Miss';
        case Common.CELL_STATE_EMPTY:
          return 'Unknown';
        default:
          return 'Unknown';
      }
    },
  },
  watch: {
    'cell.state': {
      handler: function (newVal, oldVal) {
        switch (newVal) {
          case Common.CELL_STATE_HIT:
            this.animation = 'hit 0.5s';
            break;
          case Common.CELL_STATE_MISS:
            this.animation = 'miss 1s';
            break;
          default:
            this.animation = 'none';
            break;
        }
      },
      // immediate: true
    },
  },
};
</script>
