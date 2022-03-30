// Action.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { randomUUID } from 'crypto'

class Action {
  constructor(type, data, userId) {
    this.id = randomUUID()

    this.type = type
    this.userId = userId // userId of the player who made the action

    this.playerIndex // set by Game, index of player in game.players.

    this.data = data
  }

  getDataForClient() {}
}

Action.getDataForClient = function (action, userId) {
  return {
    id: action.id,
    type: action.type,
    data: action.data,
    playerIndex: action.playerIndex,
    userId: action.userId,
  }
}

export default Action
