<!--
  HitBoardView.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="hit-board board" :style="styles" ref="boardEl">
    <div class="hit-board-ships">
      <PlacedShip v-for="ship in board.revealedShips" :key="ship.id" :ship="ship" :board="board">
      </PlacedShip>
    </div>

    <div class="hit-board-grid">
      <div class="hit-board-row" v-for="row in board.cells.length" :key="row - 1">
        <HitBoardCell v-for="cell in board.cells[row - 1]" :key="cell.id" :cell="cell" :board="board"
          class="hit-board-cell">
        </HitBoardCell>
      </div>
    </div>

    <Crosshair :target="target" :board="board" />
  </div>
</template>

<script setup>
import HitBoardCell from './HitBoardCell.vue';
import PlacedShip from './PlacedShip.vue';
import Crosshair from './Crosshair.vue';

import { useAspectRatio } from '@app/components/base-ui/aspectRatio';
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  board: {
    type: Object,
    required: true,
  },
  target: {
    type: Object,
  },
});

const boardEl = ref(null);
useAspectRatio(1, boardEl);

const styles = computed(() => {
  return {
    'background-size': `${(1 / props.board.width) * 100}% ${(1 / props.board.height) * 100
      }%`,
  };
});
</script>
