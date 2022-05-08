<!--
  ShipPlacer.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="ship-placer-container" ref="boardEl">
    <div
      class="ship-placer-board"
      ref="board"
    >
      <div class="ship-placer-row" v-for="y in board.width" :key="y">
        <div
          class="ship-placer-cell"
          v-for="x in board.height"
          :key="x"
          :x="x - 1"
          :y="y - 1"
        ></div>
      </div>
    </div>

    <div class="ship-placer-grid" :style="gridStyles">
      <placed-ship
        v-for="ship of board.ships"
        :ship="ship"
        :board="board"
        :drag="true"
        :key="ship.id"
      ></placed-ship>
    </div>
  </div>
</template>

<script>
import bus from '@app/js/vue-event-bus';
import Common from '/gamecommons/seabattle';
import PlacedShip from './PlacedShip.vue';
import cloneDeep from 'lodash.clonedeep';

export default {
  data() {
    return {
      lastMove: {},
      targetMoved: false,
    };
  },
  props: ['board'],
  computed: {
    gridStyles() {
      var board = this.board;
      return {
        'grid-template-columns': `repeat(${board.width}, ${
          100 / board.width
        }%)`,
        'grid-template-rows': `repeat(${board.height}, ${100 / board.height}%)`,
        'background-size': 100 / board.width + '% ' + 100 / board.height + '%',
      };
    },
  },
  methods: {
    moveShip(pos) {
      var ship = this.dragTarget;
      var board = cloneDeep(this.board);
      board.ships.forEach((element) => {
        if (element.id == ship.id) {
          if (pos.x !== undefined) element.x = pos.x;
          if (pos.y !== undefined) element.y = pos.y;
          if (pos.direction !== undefined) element.direction = pos.direction;
        }
      });

      if (Common.isBoardValid(board, 0)) {
        if (
          (ship.x != pos.x && pos.x !== undefined) ||
          (ship.y != pos.y && pos.y !== undefined)
        ) {
          this.targetMoved = true;
        }
        if (pos.x !== undefined) ship.x = pos.x;
        if (pos.y !== undefined) ship.y = pos.y;
        if (pos.direction !== undefined) ship.direction = pos.direction;
      }
    },
  },
  components: {
    PlacedShip,
  },
};
</script>

<script setup>
import { useAspectRatio } from '@app/components/base-ui/aspectRatio';
import { ref, computed, onMounted } from 'vue';

const boardEl = ref(null);
useAspectRatio(1, boardEl);
</script>
