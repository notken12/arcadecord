<!--
  PowerControl.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import gsap from 'gsap'
import { Draggable } from 'gsap/dist/Draggable.js'

import { onMounted, ref } from 'vue'

const emit = defineEmits(['hit', 'powerchange'])

const el = ref(null)
const stick = ref(null)

let isPointerDown = false
let stickHeight

function pointerDown(e) {
  let { clientX: x, clientY: y } = e.touches?.[0] || e
  isPointerDown = true
}

function pointerMove(e) {
  if (!isPointerDown) return
  let { clientX: x, clientY: y } = e.touches?.[0] || e
  let offset = y - el.value.getBoundingClientRect().top
  let stickHeight = stick.value.getBoundingClientRect().height
  if (offset > stickHeight) {
    offset = stickHeight
  }
  if (offset < 0) {
    offset = 0
  }

  stick.value.style.transform = `translateY(${offset}px)`
}

function pointerUp(e) {
  let { clientX: x, clientY: y } = e.touches?.[0] || e
  let offset = y - el.value.getBoundingClientRect().top

  stick.value.style.transform = `translateY(0px)`
}

onMounted(() => {
  gsap.registerPlugin(Draggable)

  let height = el.value.getBoundingClientRect().height

  Draggable.create(stick.value, {
    type: 'y',
    edgeResistance: 0.0,
    bounds: {
      minY: 0,
      maxY: height,
    },
    liveSnap: {
      y: function (value) {
        if (value < 0) {
          return 0
        }
        if (value > height) {
          return height
        }
        return value
      },
    },
    onRelease: function () {
      console.log('hit', this.y / height)
      emit('hit', this.y / height)
      this.y = 0
      gsap.to(this.target, {
        duration: 0.1,
        y: 0,
      })
      this.update()
    },
    onDrag: function () {
      emit('powerchange', this.y / height)
    },
  })
})

onMounted(() => {
  stickHeight = stick.value.getBoundingClientRect().height
})
</script>

<template>
  <div class="power-control" ref="el">
    <div class="stick" ref="stick">
      <div class="highlight"></div>
      <div class="img"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.power-control {
  border: 1px gray solid;
  width: 32px;
  height: 370px;
  border-radius: 8px;
  background-color: transparent;
  background-image: linear-gradient(gray 1px, transparent 1px);
  background-size: 100% 20.05%;
  background-position: 0 -1px;
}

.stick {
  width: 100%;
  height: 100%;
  z-index: 3;
  display: flex;
  flex-direction: column;
}

.highlight {
  background: #0000ff55;
  height: 0%;
}

.img {
  background-image: url('/assets/8ball/cuestick.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: drop-shadow(0 0 4px #000000aa);
  height: 100%;
}
</style>
