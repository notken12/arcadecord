// common.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import Common from './common.js';
import GameFlow from '../../GameFlow.js';
import { GUESS_WORDS, ANSWER_WORDS } from './words.js';

const HINT = {
  WRONG: 0,
  ELSEWHERE: 1,
  CORRECT: 2,
};

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

function getHints(guess, answer) {
  const hints = [];
  const used = [];

  for (let i = 0; i < answer.length; i++) {
    hints.push(HINT.WRONG);
  }

  for (let i = 0; i < answer.length; i++) {
    let letter = answer[i];
    if (guess[i] === letter && !used[i]) {
      hints[i] = HINT.CORRECT;
      used[i] = true;
      continue;
    }

    for (let j = 0; j < guess.length; j++) {
      if (used[j]) continue;
      if (guess[j] === letter) {
        hints[j] = HINT.ELSEWHERE;
        used[j] = true;
        break;
      }
    }
  }

  return hints;
}

async function action_chooseWord(game, action) {
  let { playerIndex } = action;
  let { word } = action.data;

  // Word must be in lowercase
  if (word.toLowerCase() != word) {
    return false;
  }

  // Can't choose a word if you already have one
  if (
    game.data.answers[playerIndex] !== undefined &&
    game.data.answers[playerIndex] !== null
  ) {
    return false;
  }

  if (word.length !== WORD_LENGTH) {
    return false;
  }

  // Checking if the word is valid
  if (!inWordList(word)) {
    return false;
  }

  game.data.answers[playerIndex] = word;

  if (!game.data.answers[0] || !game.data.answers[1]) {
    await GameFlow.endTurn(game);
  }
  return game;
}

function inWordList(word) {
  return binarySearch(GUESS_WORDS, word) !== -1;
}

async function action_guess(game, action) {
  let { playerIndex } = action;
  let { word } = action.data;
  let opponentIndex = playerIndex === 0 ? 1 : 0;

  // Can't guess if you don't have a word
  if (!game.data.answers[playerIndex] || !game.data.answers[opponentIndex]) {
    return false;
  }

  // Checking if the word is valid
  if (binarySearch(GUESS_WORDS, word) === -1) {
    return false;
  }

  game.data.guesses[playerIndex].push({
    word,
    hints: getHints(word, game.data.answers[opponentIndex]),
  });

  // Whoever gets the word in the least amount of guesses wins
  // If the player who goes first guesses it right, wait for the other player to guess before declaring the winner
  if (game.data.guesses[0].length === game.data.guesses[1].length) {
    // Both players guessed the same amount of times, so check if anyone wins
    let player0Guesses = game.data.guesses[0];
    let player0Right =
      player0Guesses[player0Guesses.length - 1].word === game.data.answers[1];

    let player1Guesses = game.data.guesses[1];
    let player1Right =
      player1Guesses[player1Guesses.length - 1].word === game.data.answers[0];

    if (player0Right && player1Right) {
      // Both players guessed the words on the same guess, so it's a tie
      await GameFlow.end(game, {
        winner: -1,
      });
    } else if (player0Right) {
      await GameFlow.end(game, {
        winner: 0,
      });
    } else if (player1Right) {
      await GameFlow.end(game, {
        winner: 1,
      });
    } else if (
      game.data.guesses[0].length >= MAX_GUESSES &&
      game.data.guesses[1].length >= MAX_GUESSES
    ) {
      // Neither player guessed the word in time, tie
      await GameFlow.end(game, {
        winner: -1,
      });
    } else {
      // Neither player guessed the word, so continue the game
      await GameFlow.endTurn(game);
    }
  } else {
    // Nothing special, just end the turn
    await GameFlow.endTurn(game);
  }

  return game;
}

const binarySearch = (array, target) => {
  let startIndex = 0;
  let endIndex = array.length - 1;
  while (startIndex <= endIndex) {
    let middleIndex = Math.floor((startIndex + endIndex) / 2);
    if (target === array[middleIndex]) {
      return middleIndex;
    }
    if (target > array[middleIndex]) {
      startIndex = middleIndex + 1;
    }
    if (target < array[middleIndex]) {
      endIndex = middleIndex - 1;
    }
  }
  return -1;
};

export default {
  HINT,
  getHints,
  action_chooseWord,
  WORD_LENGTH,
  MAX_GUESSES,
  action_guess,
  inWordList,
};
