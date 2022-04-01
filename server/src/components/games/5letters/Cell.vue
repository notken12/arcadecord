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

const animated = ref(false)

const updateRefs = () => {
  letter.value = props.cell.letter
  hint.value = props.cell.hint
  if (letter.value) animated.value = true
}

const cellWatcher = async (newVal, oldVal) => {
  if (newVal === oldVal) return
  if (props.cell.hint !== null && props.cell.hint !== undefined)
    setTimeout(updateRefs, letterAnimationLength * props.index)
  else updateRefs()
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
  }
})

const styles = computed(() => {
  return {
    // animationDelay: `${props.index * letterAnimationLength}ms`,
  }
})
</script>

<template>
  <div
    class="cell"
    :class="classes"
    @animationend="animated = false"
    :style="styles"
  >
    {{ letter }}
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
