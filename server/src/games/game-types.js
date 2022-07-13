// game-types.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { readdirSync } from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';
import Game from './Game.js';

const _filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const _dirname = path.dirname(_filename);

const gameFolders = readdirSync(_dirname + '/types');

/** @typedef {Object} GameType
 * @prop {Object} options - Information about game type: name, id, min/max players. TODO: make type declaration
 * @prop {Function} Game - The game type's class which extends Game
 */

/** @type {Object.<string, GameType>} */
const gameTypes = {};

for (const folder of gameFolders) {
  let typeFolder = readdirSync(_dirname + '/types/' + folder);
  let mainFile = typeFolder.filter((file) => file.match(/main.([^\.]*)$/));
  let { default: game } = await import(`./types/${folder}/${mainFile}`);
  gameTypes[game.options.typeId] = game;
}

export { gameTypes };
