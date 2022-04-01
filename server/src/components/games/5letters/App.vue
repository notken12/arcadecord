<!--
  App.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import Board from './Board.vue'
import Keyboard from './Keyboard.vue'
import WordChooser from './WordChooser.vue'
import Toast from './Toast.vue'

import { useFacade } from '@app/components/base-ui/facade'
import bus from '@app/js/vue-event-bus'
import { ref, computed, onMounted } from 'vue'
import { letterAnimationLength } from '@app/js/games/5letters/constants'
import { replayAction, utils } from '@app/js/client-framework'

const {
  game,
  me,
  replaying,
  $replayTurn,
  $endReplay,
  $endAnimation,
  previousTurn,
} = useFacade()

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
  return (myIndex.value + 1) % 2
})

const myGuesses = computed(() => {
  return game.value.data.guesses[myIndex.value]
})

const myAnswer = computed(() => {
  return game.value.data.answers[myIndex.value]
})

const theirGuesses = computed(() => {
  return game.value.data.guesses[theirIndex.value]
})

const theirAnswer = computed(() => {
  return game.value.data.answers[theirIndex.value]
})

const middleStyles = computed(() => {
  let transform = 'translateX(-50%)'
  if (
    (replaying.value && myAnswer.value) ||
    (game.value.turn !== myIndex.value && myAnswer.value && !theirAnswer.value)
  ) {
    transform = 'translateX(0)'
  }
  return {
    transform,
  }
})

onMounted(() => {
  $replayTurn(async () => {
    for (let action of previousTurn.value.actions) {
      console.log(previousTurn.value.actions)
      replayAction(game.value, action)

      if (action.type === 'guess') {
        bus.emit('updateGuesses')
        await utils.wait(letterAnimationLength * 5)
      }
    }
    $endReplay(300)
  })
})
</script>

<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <div class="middle" :style="middleStyles">
      <!-- Game UI just for 5letters -->
      <div class="theirs">
        <div>
          <div>Word:</div>
          <div class="yourword">{{ myAnswer }}</div>
        </div>
        <div class="container">
          <Board :guesses="theirGuesses"></Board>
        </div>
      </div>
      <div class="mine">
        <h2 v-if="!myAnswer">Choose a secret word</h2>
        <div class="container">
          <WordChooser v-if="!myAnswer"></WordChooser>
          <Board
            :guesses="myGuesses"
            v-if="myAnswer && theirAnswer"
            active
          ></Board>
        </div>

        <Keyboard :guesses="myGuesses"></Keyboard>
        <Toast></Toast>
      </div>
    </div>
  </game-view>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-grow: 1;
  flex-direction: row;
  max-width: 500px;
  width: 100%;
}

.middle {
  width: 200%;
  max-width: 200vw;
  display: flex;
  flex-direction: row;
  transition: transform 0.4s ease;
}

.middle > div {
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 32px;
}

.mine {
  position: relative;
}
</style>

<style lang="scss">
* {
  box-sizing: border-box;
}

.triangle {
  border-bottom-color: white !important;
}

.board {
  display: grid;
  gap: 6px;
  grid-template-rows: repeat(6, 1fr);
  width: 380px;
  height: 72px;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 6px;
}
</style>
