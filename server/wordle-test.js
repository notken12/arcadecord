// wordle-test.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

const HINT = {
  WRONG: '⬛',
  ELSEWHERE: '🟨',
  CORRECT: '🟩',
};

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
        found = true;
        break;
      }
    }
  }

  return hints;
}

console.log(getHints('mango', 'apple'));
console.log(getHints('mango', 'mango'));
console.log(getHints('matte', 'tiles'));
console.log(getHints('trace', 'crate'));
