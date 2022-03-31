<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  letter: {
    type: String,
    required: true,
  },
})

const animated = ref(false)

watch(
  () => props.letter,
  (letter) => {
    if (letter !== '') animated.value = true
  }
)

const classes = computed(() => {
  return {
    animated: animated.value,
    empty: props.letter === '',
  }
})
</script>

<template>
  <div class="cell" :class="classes" @animationend="animated = false">
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
