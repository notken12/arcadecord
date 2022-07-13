// Player.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

/**
 * Representation of a discord user from Discord.js
 * @typedef {Object} DiscordUser
 * @property {string} id - User's Discord ID
 * @property {string} tag - Username + discriminator, ex. "mango#1234"
 * @property {string} avatar - Avatar hash, used to get avatar URL from Discord CDN
 */

/**
 * Player class to be used in game.players
 * @typedef {Object} Player
 * @property {string} id - User id in database
 * @property {DiscordUser} discordUser - The user's discord profile
 */
 class Player {
  /** @type string */
  id;
  /** @type DiscordUser */
  discordUser;
  /**
   * @param {string} id - User id in database
   * @param {DiscordUser} discordUser - The user's discord profile
   */
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