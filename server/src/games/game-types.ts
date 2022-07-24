// game-types.ts - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { readdirSync } from 'fs';

import * as path from 'path';
import { fileURLToPath } from 'url';
import Game from './Game';

const _filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const _dirname = path.dirname(_filename);

const gameFolders = readdirSync(_dirname + '/types');

type GameType = {
  options: Object;
  Game: typeof Game;
};

const gameTypes: { [typeId: string]: GameType } = {};

for (const folder of gameFolders) {
  let typeFolder = readdirSync(_dirname + '/types/' + folder);
  let mainFile = typeFolder.filter((file) => file.match(/main.([^\.]*)$/));
  let { default: game } = await import(`./types/${folder}/${mainFile}`);
  gameTypes[game.options.typeId] = game;
}

export { gameTypes };
