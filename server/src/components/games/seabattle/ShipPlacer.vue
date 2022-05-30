<!--
  ShipPlacer.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="ship-placer-container" ref="boardEl">
    <div class="ship-placer-board">
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

<script setup>
import Common from '/gamecommons/seabattle';
import PlacedShip from './PlacedShip.vue';

import cloneDeep from 'lodash.clonedeep';
import { useAspectRatio } from '@app/components/base-ui/aspectRatio';
import { ref, computed, onMounted, provide } from 'vue';
import bus from '@app/js/vue-event-bus';

const props = defineProps({
  board: {
    type: Object,
    required: true,
  },
});

const gridStyles = computed(() => {
  let { width, height } = props.board;
  return {
    'grid-template-columns': `repeat(${width}, ${100 / width}%)`,
    'grid-template-rows': `repeat(${height}, ${100 / height}%)`,
    'background-size': 100 / width + '% ' + 100 / height + '%',
  };
});

const boardEl = ref(null);
useAspectRatio(1, boardEl);

provide('boardEl', boardEl);

const moveShip = (id, pos) => {
  let ship = props.board.ships.find((s) => s.id === id);
  if (!ship) return;
  let board = cloneDeep(props.board);

  let correspondingShip = board.ships.find((s) => s.id === id);

  if (pos.col !== undefined) correspondingShip.col = pos.col;
  if (pos.row !== undefined) correspondingShip.row = pos.row;
  if (pos.dir !== undefined) correspondingShip.dir = pos.dir;

  if (Common.isBoardValid(board, 0)) {
    if (pos.col !== undefined) ship.col = pos.col;
    if (pos.row !== undefined) ship.row = pos.row;
    if (pos.dir !== undefined) ship.dir = pos.dir;
  }
};

onMounted(() => {
  bus.on('moveShip', ({ id, pos }) => {
    moveShip(id, pos);
  });
});
</script>
