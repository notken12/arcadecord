<!--
  Keyboard.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { onMounted } from 'vue'
import bus from '@app/js/vue-event-bus'

const props = defineProps({
  guesses: {
    type: Array,
    required: true,
  },
})

const submitWord = () => {}
const typeLetter = (l) => {}
const backspace = () => {}

const alphabet = 'qwertyuiopasdfghjklzxcvbnm'

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitWord()
    } else if (e.key === 'Backspace') {
      backspace()
    } else if (alphabet.includes(e.key)) {
      typeLetter(e.key)
    }
  })
})

bus.on('submitWord', () => {
  submitWord()
})
</script>
