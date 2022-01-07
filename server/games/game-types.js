import { readdirSync } from 'fs';

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const gameFolders = readdirSync(__dirname + '/types');

var gameTypes = {};

for (const folder of gameFolders) {
    let {default: game} = await import(`./types/${folder}/main.js`);
    gameTypes[game.options.typeId] = game;
}

export {gameTypes};