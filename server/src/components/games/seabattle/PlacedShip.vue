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
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useFacade } from '@app/components/base-ui/facade';
import Common from '/gamecommons/seabattle';

import gsap from 'gsap';
import Draggable from 'gsap/dist/Draggable.js';

import cloneDeep from 'lodash.clonedeep';
import bus from '@app/js/vue-event-bus';

const { game } = useFacade();

const boardEl = inject('boardEl');

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
  drag: Boolean,
});

const el = ref(null);

const classes = computed(() => {
  return props.selected ? 'selected' : '';
});

const styles = computed(() => {
  return {
    'transform-origin': `${50 / props.ship.len}% 50%`,
    width: `${props.ship.len * 10}%`,
  };
});

const imgURL = computed(() => {
  var ship = props.ship;
  var shipType = ship.type;
  return '/assets/seabattle/ships/' + shipType + '.svg';
});

const updatePos = (animate) => {
  const pos = getPos();
  gsap.to(el.value, {
    duration: animate ? 0.3 : 0,
    rotation: rotations[props.ship.dir],
    x: pos.x,
    y: pos.y,
  });
};

const getPos = () => {
  return {
    x: (props.ship.col * 100) / props.ship.len + '%',
    y: props.ship.row * 100 + '%',
  };
};

const moveShip = (pos) => {
  bus.emit('moveShip', { id: props.ship.id, pos });
};

const createDraggable = () => {
  gsap.registerPlugin(Draggable);
  Draggable.create(el.value, {
    type: 'x,y',
    // liveSnap: {
    //   points: (point) => {
    //     let increment = boardEl.value.offsetWidth / 10;
    //     let pos = {
    //       col: Math.round(point.x / increment),
    //       row: Math.round(point.y / increment),
    //     };
    //     console.log(point);
    //     console.log(pos);
    //     if (moveShip(pos))
    //       return {
    //         x: pos.col * increment,
    //         y: pos.row * increment,
    //       };
    //
    //     return getPos();
    //   },
    // },
    // snap: 'AFTER',
    // bounds: boardEl.value,
    onDragEnd: function (e) {
      let increment = boardEl.value.offsetWidth / 10;
      let pos = {
        col: Math.round(this.x / increment),
        row: Math.round(this.y / increment),
      };
      // console.log(point);
      moveShip(pos);
      setTimeout(() => updatePos(true), 0);
    },
    onClick: function (e) {
      moveShip({ dir: (props.ship.dir + 1) % 4 });
    },
    zIndexBoost: true,
  });
};

onMounted(() => {
  updatePos();
  if (props.drag) {
    createDraggable();
  }
});

watch(
  () => [props.ship.row, props.ship.col, props.ship.dir],
  () => {
    updatePos(true);
  }
);
</script>

<style lang="scss">
.placed-ship {
  position: absolute;
  height: 10%;
  filter: drop-shadow(0 2px 4px #00000099);
}

.placed-ship-image {
  width: 100%;
  height: 100%;
}
</style>
