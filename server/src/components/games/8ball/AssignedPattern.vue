<script setup>
import { useFacade } from '@app/components/base-ui/facade'
import { computed, watch, ref } from 'vue'

const { game } = useFacade()

const props = defineProps({
  pattern: Number,
  playerindex: Number,
})

const tooltip = computed(() => {
  if (props.pattern === null || props.pattern === undefined) {
    return ''
  }
  if (props.pattern === 0) {
    return 'Solids'
  }
  return 'Stripes'
})

const showTooltip = ref(false)
watch(
  () => props.pattern,
  () => {
    if (props.pattern === 0 || props.pattern === 1) {
      showTooltip.value = true
    }
  }
)

const isOnRight = computed(() => {
  let i = game.value.myIndex === -1 ? 1 : game.value.myIndex
  return props.playerindex !== i
})
</script>

<template>
  <div class="wrapper" :title="tooltip" :class="{ 'right-side': isOnRight }">
    <!-- unassigned -->
    <svg
      v-if="pattern === null || pattern === undefined"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2.5"
        y="2.5"
        width="95"
        height="95"
        rx="47.5"
        stroke="#797E8D"
        stroke-width="5"
        stroke-dasharray="15 15"
      />
    </svg>

    <!--striped-->
    <svg
      v-else-if="pattern === 1"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="50" fill="white" />
      <rect y="22" width="100" height="56" fill="#797E8D" />
    </svg>

    <!--solid-->
    <svg
      v-else-if="pattern === 0"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="50" fill="#797E8D" />
    </svg>
    <div
      class="tooltip"
      v-if="pattern === 0 || pattern === 1"
      :class="{ shown: showTooltip }"
    >
      {{ tooltip }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

$size: 24px;

.wrapper {
  position: relative;
  display: flex;
  width: $size;
  height: $size;
  overflow: visible;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  z-index: 10;
}

.wrapper.right-side {
  align-items: flex-end;
}

svg {
  width: $size;
  height: $size;
  border-radius: 50%;
  box-shadow: theme.$md-elevation-level2;
}

.tooltip {
  background: theme.$md-sys-background;
  padding: 8px;
  color: theme.$md-sys-on-surface;
  position: absolute;
  top: $size;
  margin-top: 8px;
  z-index: 99;
  border-radius: 4px;
  box-shadow: theme.$md-elevation-level2;
  pointer-events: none;
  opacity: 0;
}

.tooltip.shown {
  animation: appear 2s;
}

@keyframes appear {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
