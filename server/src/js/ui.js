// ui.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

function replayTurn() {
  // Replay the last player's turn
  // Use Facade to manage the game state for animations
  facade.commit('REPLAY_TURN');
}

export { replayTurn };
