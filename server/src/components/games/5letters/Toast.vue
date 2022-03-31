<!--
  Toast.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import bus from '@app/js/vue-event-bus'
import { ref } from 'vue'

const msg = ref('')
const hidden = ref(true)

bus.on('toast', (message) => {
  msg.value = message
  hidden.value = false
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
}

.shown {
  animation: show 1.5s;
}

@keyframes show {
  0% {
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
