// create-game.controller.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import db from '../../db/db2.js';
import { gameTypes } from '../src/games/game-types.js';

// Get host configuration
import { loadHostConfig } from '../config.js';
const host = loadHostConfig();

const cyrb53 = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

// Create snowflake generator
import { Generator } from 'snowflake-generator';
import Game from '../src/games/Game.js';
const seed = cyrb53(host.id);
console.log(`Snowflake generator using seed ${seed}`);
const SnowflakeGenerator = new Generator(946684800000, seed);

function toBase62(n) {
  if (n === 0) {
    return '0';
  }
  var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  while (n > 0) {
    result = digits[n % digits.length] + result;
    n = parseInt(n / digits.length, 10);
  }

  return result;
}

export default async (req, res) => {
  console.log('creating game');
  try {
    // get token from headers
    var authHeader = req.headers.authorization;
    if (!authHeader) {
      res.sendStatus(200);
      return;
    }
    if (!authHeader.startsWith('Bearer ')) {
      res.sendStatus(200);
      return;
    }
    // Remove Bearer from string
    var token = authHeader.slice(7, authHeader.length);

    if (token !== process.env.GAME_SERVER_TOKEN) {
      res.sendStatus(200);
      return;
    }

    // get game options
    let game = await createGame(req.body);

    if (!game) {
      console.log('User not authorized');
      res.sendStatus(200);
      return;
    }
    game = await db.games.create(game);

    res.json(game);
  } catch (e) {
    console.error(e);
    res.sendStatus(200);
  }
};

/** JSON request body for POST /create-game
 * @typedef {Object} CreateGameBody
 * @prop {import('../src/games/Game.js').GameOptions} options - options for creating the game, passed into the new Game(options) constructor
 * @prop {string} userId - ID of user who created the game
 */

/** Create a game and add it to the database
 * @param {CreateGameBody} reqBody - Object containing options for the new game
 * @param {boolean} testing - Whether or not the game is used in the test. Disables event handlers if true (used for sending Discord messages)
 */
export async function createGame(reqBody, testing) {
  let { options, userId } = reqBody;
  const { typeId } = options;

  // get game constructor
  const Game = gameTypes[typeId].Game;

  /** @type Game */
  const game = new Game(options);
  if (testing) {
    game.test();
  }

  // Set game ID
  var snowflake = SnowflakeGenerator.generate();
  var snowflakeNum = Number(snowflake);
  game.id = toBase62(snowflakeNum);

  // add player to game
  var user = await db.users.getById(userId);
  if (!user) return null;
  if (user.banned) return null;

  await game.addPlayer(user._id);
  await game.init();

  return game;
}
