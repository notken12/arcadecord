<!--
  App.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import Board from './Board.vue';
import Keyboard from './Keyboard.vue';
import WordChooser from './WordChooser.vue';
import Toast from './Toast.vue';

import { useFacade } from '@app/components/base-ui/facade';
import bus from '@app/js/vue-event-bus';
import { ref, computed, onMounted, watch } from 'vue';
import { letterAnimationLength } from '@app/js/games/5letters/constants';
import { replayAction, utils } from '@app/js/client-framework';

const {
  game,
  me,
  replaying,
  $replayTurn,
  $endReplay,
  $endAnimation,
  previousTurn,
  contested,
} = useFacade();

const toast = ref(null);

const hint = computed(() => {
  if (game.hasEnded) {
    return 'The word was: ' + theirAnswer.value.toUpperCase();
  }
  if (myAnswer.value && theirAnswer.value && !replaying.value) {
    return "Guess your opponent's word!";
  }
  return '';
});

const myIndex = computed(() => {
  if (game.value.myIndex !== -1) {
    return game.value.myIndex;
  }
  return 1;
});

const theirIndex = computed(() => {
  return (myIndex.value + 1) % 2;
});

const myGuesses = computed(() => {
  return game.value.data.guesses[myIndex.value];
});

const myAnswer = computed(() => {
  return game.value.data.answers[myIndex.value];
});

const theirGuesses = computed(() => {
  return game.value.data.guesses[theirIndex.value];
});

const theirAnswer = computed(() => {
  return game.value.data.answers[theirIndex.value];
});

const middleStyles = computed(() => {
  let transform = 'translateX(-50%)';
  if (
    (replaying.value && myAnswer.value) ||
    (game.value.turn !== myIndex.value && myAnswer.value && !theirAnswer.value)
  ) {
    transform = 'translateX(0)';
  }
  return {
    transform,
  };
});

watch(
  myAnswer,
  () => {
    window.dispatchEvent(new Event('resize'));
  },
  { flush: 'post' }
);

onMounted(() => {
  $replayTurn(async () => {
    await utils.wait(300);

    for (let action of previousTurn.value.actions) {
      replayAction(game.value, action);

      if (action.type === 'guess') {
        bus.emit('updateGuesses');
        await utils.wait(letterAnimationLength * 5);
      }
    }
    $endReplay(300);
  });
  window.game = game.value;
  window.contested = contested.value;
});
</script>

<template>
  <!-- GameView component, contains all basic game UI 
            like settings button -->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <div class="middle" :style="middleStyles">
      <!-- Game UI just for 5letters -->
      <div class="theirs">
        <div class="yourword-container">
          <div>Word:</div>
          <div class="yourword">{{ myAnswer }}</div>
        </div>
        <div class="container">
          <Board :guesses="theirGuesses"></Board>
        </div>
      </div>
      <div class="mine">
        <div class="container">
          <WordChooser v-if="!myAnswer"></WordChooser>
          <!-- v-if="myAnswer && theirAnswer" -->

          <Board
            :guesses="myGuesses"
            v-show="myAnswer != null"
            :active="myAnswer != null"
          ></Board>
        </div>

        <Keyboard :guesses="myGuesses"></Keyboard>
      </div>
    </div>
    <Toast></Toast>
  </game-view>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  // flex-grow: 1;
  flex-direction: row;
  max-width: 500px;
  width: 100%;
  height: 100%;
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

.yourword {
  text-transform: uppercase;
  font-weight: bold;
}

.yourword-container {
  display: flex;
  flex-direction: column;
  align-items: center;
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
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 6px;
}
</style>
