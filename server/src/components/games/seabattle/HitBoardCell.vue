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

<script setup>
import Common from '/gamecommons/seabattle';
import GameFlow from '@app/js/GameFlow.js';
import bus from '@app/js/vue-event-bus';
import { computed, ref, watch } from 'vue';
import { useFacade } from '@app/components/base-ui/facade';

const props = defineProps({
  cell: {
    type: Object,
    required: true,
  },
  board: {
    type: Object,
    required: true,
  },
});

const { game, replaying } = useFacade();

const animation = ref('none');

const imgURL = computed(() => {
  return `/assets/seabattle/cell-states/${props.cell.state}.svg`;
});

const cellStyles = computed(() => {
  props.board.ships = props.board.revealedShips;

  let show = !Common.getShipAt(props.board, props.cell.col, props.cell.row);

  return {
    'background-image':
      show && props.cell.state !== Common.CELL_STATE_EMPTY
        ? `url(${imgURL.value})`
        : 'none',
    animation: animation.value,
  };
});

const cellClicked = () => {
  if (replaying.value) return;
  if (
    props.cell.state === Common.CELL_STATE_EMPTY &&
    GameFlow.isItMyTurn(game.value)
  )
    bus.emit('changeCellect', props.cell);
};

watch(
  () => props.cell.state,
  (newVal) => {
    switch (newVal) {
      case Common.CELL_STATE_HIT:
        animation.value = 'hit 0.5s';
        break;
      case Common.CELL_STATE_MISS:
        animation.value = 'miss 1s';
        break;
      default:
        animation.value = 'none';
        break;
    }
  }
);
</script>
