<script setup>
import Board from './Board.vue'
import Keyboard from './Keyboard.vue'
import WordChooser from './WordChooser.vue'
import Toast from './Toast.vue'

import { useFacade } from '@app/components/base-ui/facade'
import bus from '@app/js/vue-event-bus'
import { onMounted } from 'vue'

const { game, me } = useFacade()

const toast = ref(null)

const hint = computed(() => {
  return ''
})

const myIndex = computed(() => {
  if (game.value.myIndex !== -1) {
    return game.value.myIndex
  }
  return 1
})

const theirIndex = computed(() => {
  return (myIndex + 1) % 2
})

const myGuesses = computed(() => {
  return game.value.guesses[myIndex.value]
})

const myAnswer = computed(() => {
  return game.value.answers[myIndex.value]
})

const theirGuesses = computed()
</script>

<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <div class="middle">
      <!-- Game UI just for 5letters -->
      <div class="theirs">
        <div>
          <div>Word:</div>
          <div class="yourword">{{ myAnswer }}</div>
        </div>
        <Board :guesses="theirGuesses"></Board>
      </div>
      <div class="mine">
        <WordChooser v-if="!myAnswer"></WordChooser>
        <Board :guesses="myGuesses" v-if="myAnswer"></Board>
        <Keyboard :guesses="myGuesses"></Keyboard>
        <Toast></Toast>
      </div>
    </div>
  </game-view>
</template>

<style lang="scss" scoped>
.mine {
  position: relative;
}
</style>
