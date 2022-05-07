<!--
  PlacedShip.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="placed-ship" :style="styles" :class="classes" ref="el">
    <img draggable="false" :src="imgURL" class="placed-ship-image" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useFacade } from '@app/components/base-ui/facade';
import Common from '/gamecommons/seabattle';
import gsap from 'gsap';

const { game } = useFacade();

const rotations = [-90, 0, 90, 180];

const props = defineProps({
  ship: {
    type: Object,
    required: true,
  },
  selected: Boolean,
  board: {
    type: Object,
  },
});

const el = ref(null);

const classes = computed(() => {
  return props.selected ? 'selected' : '';
});

const styles = computed(() => {
  return {
    'transform-origin': `${50 / props.ship.len}% 50%`,
  };
});

const imgURL = computed(() => {
  var ship = props.ship;
  var shipType = ship.type;
  return '/assets/seabattle/ships/' + shipType + '.svg';
});

const updatePos = (animate) => {
  gsap.to(el.value, {
    duration: animate ? 0.3 : 0,
    rotation: rotations[props.ship.dir],
    x: (props.ship.col * 100) / props.ship.len + '%',
    y: props.ship.row * 100 + '%',
  });
};

onMounted(() => {
  updatePos();
});

watch(
  () => [props.ship.row, props.ship.col],
  () => {
    updatePos(true);
  },
);

</script>

<style lang="scss">
.placed-ship {
  position: absolute;
  height: 10%;
  cursor: pointer;
  filter: drop-shadow(0 2px 4px #00000099);
}

.placed-ship-image {
  width: 100%;
  height: 100%;
}
</style>
