import { readdirSync } from 'fs';

import path from 'path';
import {fileURLToPath} from 'url';

const _filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const _dirname = path.dirname(_filename);

const gameFolders = readdirSync(_dirname + '/types');

var gameTypes = {};

for (const folder of gameFolders) {
    let {default: game} = await import(`./types/${folder}/main.js`);
    gameTypes[game.options.typeId] = game;
}

export {gameTypes};