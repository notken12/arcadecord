// Player.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

class Player {
  constructor(id, discordUser) {
    this.id = id;
    this.discordUser = discordUser;
  }
}

Player.getDataForClient = function (player, userId) {
  return {
    id: player.id,
    discordUser: player.discordUser,
  };
};

export default Player;
