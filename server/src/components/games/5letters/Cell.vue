<script setup>
import { ref, watch, computed } from 'vue'
import Common from '/gamecommons/5letters'

const props = defineProps({
  cell: {
    type: Object,
    required: true,
  },
})

const animated = ref(false)

watch(
  () => props.cell,
  (cell) => {
    if (cell.letter !== '') animated.value = true
  },
  { deep: true }
)

const classes = computed(() => {
  return {
    animated: animated.value,
    empty: props.cell.letter === '',
    wrong: props.cell.hint === Common.HINT.WRONG,
    correct: props.cell.hint === Common.HINT.CORRECT,
    elsewhere: props.cell.hint === Common.HINT.ELSEWHERE,
  }
})
</script>

<template>
  <div class="cell" :class="classes" @animationend="animated = false">
    {{ cell.letter }}
  </div>
</template>

<style lang="scss" scoped>
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
  border: 2px #bbb solid;
  border-radius: 6px;
  transition: border-color 0.1s;
}

.wrong,
.elsewhere,
.correct {
  border: none;
}

.wrong {
  background: #333;
}

.elsewhere {
  background: #dea335;
}

.correct {
  background: #4ed230;
}

.empty {
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
</style>
