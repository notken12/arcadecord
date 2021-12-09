const fs = require('fs');

const gameFolders = fs.readdirSync(__dirname + '/types');

for (const folder of gameFolders) {
    const game = require(`./types/${folder}/main`);
    exports[game.options.typeId] = game;
}