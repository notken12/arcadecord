<script setup>
import { useFacade } from './facade'

const { $endReplay } = useFacade()

const fastForward = () => {
  $endReplay(0)
}
</script>

<template>
  <div class="fast-forward" @click="fastForward">
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.5">
        <rect width="100" height="100" rx="50" fill="#444444" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M52 74L81 49.5L52 25V44.431L29 25V74L52 54.569V74Z"
          fill="white"
        />
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.fast-forward {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 72px;
  height: 72px;
  border-radius: 72px;
  cursor: pointer;
  z-index: 100;
}

svg {
  width: 100%;
  height: 100%;
}
</style>
