<!--
  DropButton.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <button v-on:click="placePiece" :class="{ hidden: selectedColumn === null }">
    Go
  </button>
</template>

<script setup>
import { useFacade } from '@app/components/base-ui/facade';
import GameFlow from '@app/js/GameFlow';
import bus from '@app/js/vue-event-bus';

const { $runAction, $endAnimation } = useFacade();

const props = defineProps({
  selectedColumn: {
    type: Number,
    default: null,
  },
});

const placePiece = () => {
  $runAction('place', { col: props.selectedColumn });
  $endAnimation(300);
  bus.emit('changeColumn', null);
};
</script>

<style lang="scss">
@use 'scss/base/_theme' as theme;

.hidden {
  opacity: 0;
  pointer-events: none;
}
</style>
