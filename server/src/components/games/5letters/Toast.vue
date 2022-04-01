<!--
  Toast.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import bus from '@app/js/vue-event-bus'
import { onMounted, onUnmounted, ref } from 'vue'

const msg = ref('')
const hidden = ref(true)

const toast = (message) => {
  msg.value = message
  hidden.value = false
}

onMounted(() => {
  bus.on('toast', toast)
})

onUnmounted(() => {
  bus.off('toast', toast)
})
</script>

<template>
  <div class="toast" @animationend="hidden = true" :class="{ shown: !hidden }">
    {{ msg }}
  </div>
</template>

<style lang="scss">
.toast {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  border-radius: 8px;
  padding: 16px;
  background-color: #444;
}

.shown {
  animation: show 1.5s;
}

@keyframes show {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
