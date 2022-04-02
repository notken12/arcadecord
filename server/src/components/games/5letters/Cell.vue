<!--
  Cell.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { ref, watch, computed } from 'vue'
import Common from '/gamecommons/5letters'
import { letterAnimationLength } from '@app/js/games/5letters/constants'
import { utils } from '@app/js/client-framework'

const props = defineProps({
  cell: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

const letter = ref('')
letter.value = props.cell.letter
const hint = ref(null)
hint.value = props.cell.hint
const hintLetter = ref('')
hintLetter.value = props.cell.hintLetter

const animated = ref(false)

const updateRefs = () => {
  letter.value = props.cell.letter
  hint.value = props.cell.hint
  hintLetter.value = props.cell.hintLetter
  if (letter.value && !hintLetter.value) animated.value = true
}

const cellWatcher = async (newVal, oldVal) => {
  if (newVal === oldVal) return
  // if (props.cell.hint !== null && props.cell.hint !== undefined)
  //   setTimeout(updateRefs, letterAnimationLength * props.index)
  // else updateRefs()
  updateRefs()
}

watch(() => props.cell.letter, cellWatcher)

watch(() => props.cell.hint, cellWatcher)

const classes = computed(() => {
  return {
    animated: animated.value,
    empty: letter.value === '',
    wrong: hint.value === Common.HINT.WRONG,
    correct: hint.value === Common.HINT.CORRECT,
    elsewhere: hint.value === Common.HINT.ELSEWHERE,
    revealed: hintLetter.value,
  }
})

const frontStyles = computed(() => {
  return {
    transitionDelay: hintLetter.value
      ? `${props.index * letterAnimationLength}ms`
      : '0ms',
  }
})

const backStyles = computed(() => {
  return {
    transitionDelay: frontStyles.value.transitionDelay,
    animationDelay: hintLetter.value
      ? `${(props.index * letterAnimationLength) / 3}ms`
      : '0ms',
  }
})
</script>

<template>
  <div class="cell" :class="classes" @animationend="animated = false">
    <div class="front" :style="frontStyles">{{ letter }}</div>
    <div class="back" :style="backStyles">{{ hintLetter }}</div>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/games/5letters.scss' as *;

.cell {
  width: 100%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  line-height: 2rem;
  font-weight: bold;
  vertical-align: middle;
  box-sizing: border-box;
  text-transform: uppercase;
  user-select: none;
  border-radius: 6px;
  transition: border-color 0.1s;
  position: relative;
}

.back,
.front {
  border-radius: 6px;
}

.wrong .back,
.elsewhere .back,
.correct .back {
  border: none;
}

.wrong .back {
  background: $wrong-color;
}

.elsewhere .back {
  background: $elsewhere-color;
}

.correct .back {
  background: $correct-color;
}

.front {
  border: 2px #bbb solid;
}

.empty .front {
  border: 2px #666 solid;
}

.cell::before {
  content: '';
  padding-bottom: 100%;
  display: inline-block;
}

.animated {
  animation: pop 0.2s ease;
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

.front,
.back {
  box-sizing: border-box;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.4s;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.back,
.revealed .front {
  transform: rotateX(180deg);
}

.revealed .back {
  transform: rotateX(0);
}
</style>
