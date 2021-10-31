var games = {};

module.exports = {
    addGame: function(game) {
        games[game.id] = game;
    },
    getGame: function(id) {
        return games[id];
    }
}