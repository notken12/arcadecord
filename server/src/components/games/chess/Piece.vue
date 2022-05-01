<!--
  Piece.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="piece" :style="styles" :class="classes" ref="pieceEl"></div>
</template>

<script setup>
import gsap from 'gsap';
import { Draggable } from 'gsap/dist/Draggable.js';

import bus from '@app/js/vue-event-bus';

import { useFacade } from '@app/components/base-ui/facade';

import { computed, inject, onMounted, watch, ref } from 'vue';

const { game } = useFacade();
const props = defineProps({
  piece: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  moves: {
    type: Array,
    default: [],
  },
  incheck: {
    type: Boolean,
    default: false,
  },
});

const grid = inject('grid');

const pieceEl = ref(null);

const myColor = computed(() => {
  let index = game.value.myIndex === -1 ? 1 : game.value.myIndex;
  return game.value.data.colors[index];
});

const styles = computed(() => {
  let cursor = props.piece.color === props.myColor ? 'grab' : 'default';
  let texturePositions = {
    p: 0,
    r: 1,
    n: 2,
    b: 3,
    q: 4,
    k: 5,
  };
  let backgroundPositionX =
    (texturePositions[props.piece.type] / 5) * 100 + '%';
  return {
    cursor,
    backgroundPositionX,
  };
});

const classes = computed(() => {
  let classes = [];
  if (props.piece.color === 1) {
    classes.push('black');
  }
  if (props.incheck) {
    classes.push('incheck');
  }
  return classes;
});

const animate = (duration) => {
  let top = ((7 - props.piece.rank) / 1) * 100;
  let left = (props.piece.file / 1) * 100;
  gsap.to(pieceEl.value, {
    x: left + '%',
    y: top + '%',
    ease: 'power3.inOut',
    duration: duration ?? 0.25,
    rotation: myColor.value === 1 ? 180 : 0,
  });
};

watch(
  () => props.piece,
  () => {
    animate();
  },
  { deep: true }
);
// console.log(gsap);
// console.log(Draggable);
// gsap.registerPlugin(Draggable);
onMounted(() => {
  gsap.registerPlugin(Draggable);

  if (props.piece.color === myColor.value) {
    Draggable.create(pieceEl.value, {
      type: 'x,y',
      snap: {
        points: (point) => {
          let increment = grid.value.offsetWidth / 8;
          return {
            x: Math.round(point.x / increment) * increment,
            y: Math.round(point.y / increment) * increment,
          };
        },
      },
      snap: 'AFTER',
      onRelease: function (e) {
        let increment = grid.value.offsetWidth / 8;
        let point = { x: this.endX, y: this.endY };
        let file = Math.round(point.x / increment);
        let rank = 7 - Math.round(point.y / increment);
        if (file === props.piece.file && rank === props.piece.rank) {
          animate();
          pieceEl.value.style.zIndex = 0;
          return;
        }
        let moves = props.moves;
        let move = moves.find(
          (m) =>
            m.to[0] === file &&
            m.to[1] === rank &&
            m.from[0] === props.piece.file &&
            m.from[1] === props.piece.rank
        );
        if (!move) {
          animate();
          pieceEl.value.style.zIndex = 0;
          return;
        }
        bus.emit('make-move', move);
        pieceEl.value.style.zIndex = 0;
      },
      onPress: function (e) {
        bus.emit('piece-pointer-down', props.piece);
      },
      zIndexBoost: true,
    });
  }

  animate(0);
});
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;
.piece {
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.7));
  background-image: url('/assets/chess/white_pieces.svg');
  background-size: auto 100%;
  cursor: pointer;
  position: absolute;
  left: 0;
  top: 0;
  width: 12.5%;
  height: 12.5%;
  box-sizing: border-box;
  z-index: 0;
}
.black {
  background-image: url('/assets/chess/black_pieces.svg');
}
.selected {
  background-color: #ffffff88;
}
.incheck {
  background-color: #ff000088;
}
</style>
