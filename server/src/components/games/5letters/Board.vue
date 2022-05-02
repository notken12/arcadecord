<!--
  Board.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue';
import { useAspectRatio } from '@app/components/base-ui/aspectRatio';
import Cell from './Cell.vue';
import bus from '@app/js/vue-event-bus';
import { useFacade } from '@app/components/base-ui/facade';
import { letterAnimationLength } from '@app/js/games/5letters/constants';
import cloneDeep from 'lodash.clonedeep';
import { utils } from '@app/js/client-framework';
import Common from '/gamecommons/5letters';

const { $runAction, game, replaying, $endAnimation } = useFacade();

const boardEl = ref(null);

useAspectRatio((parentWidth, parentHeight) => {
  const gap = 6;
  const availWidth = parentWidth - gap * 4;
  const availHeight = parentHeight - gap * 5;
  const ratio = 5 / 6;
  const parentRatio = availWidth / availHeight;

  if (parentRatio > ratio) {
    // parent is wider than the aspect ratio
    return {
      width: availHeight * ratio + gap * 4,
      height: availHeight + gap * 5,
    };
  } else {
    // parent is taller than the aspect ratio
    return {
      width: availWidth + gap * 4,
      height: availWidth / ratio + gap * 5,
    };
  }
}, boardEl);

const props = defineProps({
  guesses: {
    type: Array,
    required: true,
  },
  active: {
    type: Boolean,
    required: false,
  },
});

// 2d array of board guesses
const grid = reactive([]);
for (let i = 0; i < 6; i++) {
  let row = [];
  for (let i = 0; i < 5; i++) {
    row.push({ letter: '' });
  }
  grid.push(row);
}

for (let j = 0; j < props.guesses.length; j++) {
  let guess = props.guesses[j];

  if (guess)
    for (let i = 0; i < guess.word.length; i++) {
      grid[j][i].hintLetter = guess.word[i];
      grid[j][i].hint = guess.hints[i];
    }
}

const getInsertionRow = () => {
  return props.guesses.length;
};

const getInsertionIndex = () => {
  let row = grid[getInsertionRow()];
  if (!row) {
    return -1;
  }
  let index = -1;
  for (let i = 0; i < row.length; i++) {
    if (row[i].letter === '') {
      index = i;
      break;
    }
  }
  return index;
};

const keyboardPress = (letter) => {
  if (!props.active) return;
  if (!game.value.data.answers[game.value.myIndex]) return;
  const row = getInsertionRow();
  const index = getInsertionIndex();
  if (index !== -1 && row !== -1) {
    grid[row][index].letter = letter;
  }
};

const keyboardBackspace = () => {
  if (!props.active) return;
  if (!game.value.data.answers[game.value.myIndex]) return;
  const row = getInsertionRow();
  let index = getInsertionIndex() - 1;
  if (index === -2) {
    index = grid[row].length - 1;
  }
  if (index === -1) {
    return;
  }
  grid[row][index].letter = '';
};

const keyboardEnter = () => {
  if (!props.active) return;
  if (!game.value.data.answers[game.value.myIndex]) return;
  const rowIndex = getInsertionRow();
  const index = getInsertionIndex();
  if (rowIndex !== -1) {
    let row = grid[rowIndex];
    let word = '';
    for (let letter of row) {
      word += letter.letter;
    }
    if (word.length < 5) {
      bus.emit('toast', 'Too short!');
      return;
    } else if (word.length > 5) {
      bus.emit('toast', 'Too long!');
      return;
    }

    if (Common.inWordList(word)) {
      $runAction('guess', { word });
      $endAnimation(letterAnimationLength * 5 + 300);
    } else {
      bus.emit('toast', 'Not in word list');
      return;
    }
    console.log('updateguesses from keyboardenter');
    bus.emit('updateGuesses');
  }
};

onMounted(() => {
  bus.on('keyboard:press', keyboardPress);
  bus.on('keyboard:backspace', keyboardBackspace);
  bus.on('keyboard:enter', keyboardEnter);
  let lastGuess = props.guesses[props.guesses.length - 1];
});

onUnmounted(() => {
  bus.off('keyboard:press', keyboardPress);
  bus.off('keyboard:backspace', keyboardBackspace);
  bus.off('keyboard:enter', keyboardEnter);
});

// let lastGuessIndex = null

const theirAnswer = computed(() => {
  let myIndex = game.value.myIndex;
  if (myIndex === -1) {
    myIndex = 1;
  }
  let theirIndex = (myIndex + 1) % 2;

  return game.value.data.answers[theirIndex];
});

onMounted(() => {
  bus.on('updateGuesses', async () => {
    console.log('updateguesses');
    let guessIndex = props.guesses.length - 1;
    let lastGuess = cloneDeep(props.guesses[guessIndex]);
    if (!lastGuess) return;

    // if (guessIndex === lastGuessIndex) return
    // lastGuessIndex = guessIndex + 0

    for (let i = 0; i < 5; i++) {
      grid[guessIndex][i].hintLetter = lastGuess.word[i];
      grid[guessIndex][i].hint = lastGuess.hints[i];
    }
  });
});
</script>

<template>
  <div class="board" ref="boardEl">
    <div v-for="row in grid" :key="grid.indexOf(row)" class="row">
      <Cell
        v-for="i in row.length"
        :cell="row[i - 1]"
        :key="i - 1"
        :index="i - 1"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$gap: 8px;
</style>
