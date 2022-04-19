<!--
  SpinControl.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import gsap from 'gsap';
import { Draggable } from 'gsap/dist/Draggable.js';
import { onMounted, ref, reactive, watch } from 'vue';

const emit = defineEmits(['spinchange']);
const focused = ref(false);

const circle = ref(null);
const dot = ref(null);
const minidot = ref(null);

const focus = () => {
  focused.value = true;
};

const unfocus = () => {
  focused.value = false;

  spin.x = point.x;
  spin.y = point.y;
  emit('spinchange', { x: point.x / 40, y: point.y / -40 });

  isPointerDown = false;
};

const spin = reactive({ x: 0, y: 0 });

let isPointerDown = false;
let point;

watch(
  spin,
  () => {
    gsap.to(minidot.value, {
      duration: 0,
      x: (spin.x * 14) / 40,
      y: (spin.y * 14) / 40,
    });
  },
  { deep: true }
);

function pointerDown(e) {
  isPointerDown = true;
  let { clientX: x, clientY: y } = e.touches?.[0] || e;
  let offsetX =
    x -
    circle.value.getBoundingClientRect().left -
    circle.value.clientWidth / 2;
  let offsetY =
    y -
    circle.value.getBoundingClientRect().top -
    circle.value.clientHeight / 2;

  let distFromCenter = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));

  point = {
    x: offsetX,
    y: offsetY,
  };

  if (distFromCenter > 40) {
    point = {
      x: Math.cos(Math.atan2(offsetY, offsetX)) * 40,
      y: Math.sin(Math.atan2(offsetY, offsetX)) * 40,
    };
  }
  gsap.to(dot.value, {
    duration: 0,
    x: point.x,
    y: point.y,
  });
}

function pointerMove(e) {
  e.preventDefault();
  if (!isPointerDown) return;
  let { clientX: x, clientY: y } = e.touches?.[0] || e;
  let offsetX =
    x -
    circle.value.getBoundingClientRect().left -
    circle.value.clientWidth / 2;
  let offsetY =
    y -
    circle.value.getBoundingClientRect().top -
    circle.value.clientHeight / 2;

  let distFromCenter = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));

  point = {
    x: offsetX,
    y: offsetY,
  };

  if (distFromCenter > 40) {
    point = {
      x: Math.cos(Math.atan2(offsetY, offsetX)) * 40,
      y: Math.sin(Math.atan2(offsetY, offsetX)) * 40,
    };
  }
  gsap.to(dot.value, {
    duration: 0,
    x: point.x,
    y: point.y,
  });
}

function pointerUp(e) {
  e.preventDefault();
  isPointerDown = false;
  let { clientX: x, clientY: y } = e.touches?.[0] || e;

  spin.x = point.x;
  spin.y = point.y;
  emit('spinchange', { x: point.x / 40, y: point.y / -40 });
}

onMounted(() => {
  gsap.registerPlugin(Draggable);

  // Draggable.create(dot.value, {
  //   type: 'x,y',
  //   liveSnap: {
  //     points: function (point) {
  //       let distFromCenter = Math.sqrt(
  //         Math.pow(point.x, 2) + Math.pow(point.y, 2)
  //       )
  //       if (distFromCenter > 40) {
  //         return {
  //           x: Math.cos(Math.atan2(point.y, point.x)) * 40,
  //           y: Math.sin(Math.atan2(point.y, point.x)) * 40,
  //         }
  //       }
  //       return point
  //     },
  //   },
  //   onDragEnd() {
  //     spin.x = this.x
  //     spin.y = this.y
  //     emit('spinchange', spin)
  //   },
  // })
});
</script>

<template>
  <div class="container" :class="{ focused }">
    <div class="circle" @click="focus()">
      <div class="dot" ref="minidot"></div>
    </div>
  </div>
  <div
    class="modal"
    :class="{ focused }"
    @click.self="unfocus()"
    @mousemove="pointerMove($event)"
    @touchmove="pointerMove($event)"
  >
    <div
      class="circle"
      ref="circle"
      @mousedown="pointerDown($event)"
      @mouseup="pointerUp($event)"
      @touchstart="pointerDown($event)"
      @touchend="pointerUp($event)"
    >
      <div class="dot" ref="dot"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/_theme.scss' as theme;

.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container.focused {
  opacity: 0;
  pointer-events: none;
  cursor: pointer;
  transition: opacity 0.3s;
}

.modal {
  background: #00000033;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  cursor: pointer;
  transition: opacity 0.3s;

  .circle {
    width: 100px;
    height: 100px;
  }

  .dot {
    width: 20px;
    height: 20px;
  }
}

.modal.focused {
  opacity: 1;
  pointer-events: initial;
}

.placeholder {
  height: 32px;
}

.circle {
  width: 32px;
  height: 32px;
  border-radius: 100px;
  /* Created with https://www.css-gradient.com */
  background: #ffffff;
  background: -webkit-radial-gradient(center, #ffffff, #e0e0e0);
  background: -moz-radial-gradient(center, #ffffff, #e0e0e0);
  background: radial-gradient(ellipse at center, #ffffff, #e0e0e0);
  box-shadow: theme.$md-elevation-level3;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50px;
  background: #0044ff;
}
</style>
