const fs = require('fs');

const gameFiles = fs.readdirSync(__dirname + '/types').filter(file => file.endsWith('.js'));

for (const file of gameFiles) {
    const game = require(`./types/${file}`);
    exports[game.options.typeId] = game;
}