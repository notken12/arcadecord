const GameFlow = {
    endTurn(game) {

        game.turn = (game.turn + 1) % game.players.length;

        game.client.emit('end_turn', game);
    },
    end(game, result) {
        //end the game
        game.endTurn();

        game.hasEnded = true;
        if (result.winner) {
            game.winner = result.winner;
        } else {
            // draw
            game.winner = -1;
        }

        game.client.emit('end', game, result, game.turns[game.turns.length]);
    },
    start(game) {
        game.hasStarted = true;
        game.client.emit('start', game);
    }
};

window.GameFlow = GameFlow;