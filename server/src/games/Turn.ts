// Turn.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import Action from './Action.js';

class Turn {
  playerIndex: number;
  actions: Action[];
  constructor(playerIndex: number, actions?: Action[]) {
    this.playerIndex = playerIndex;
    this.actions = actions || ([] as Action[]);
  }
}

export default Turn;
