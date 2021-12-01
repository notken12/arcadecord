var GameFlow = {
    start(game) {
        //once first action has been made, start the game
        //first start and then handle first action
        game.hasStarted = true;
        game.emit('start');
    
        game.broadcastToAllSockets('start');
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
    
        game.emit('end', result);
    
        game.broadcastToAllSockets('end', true, result, game.turns[game.turns.length - 1]);
    },
    endTurn(game) {
        if (game.hasEnded) return;


        game.turn = (game.turn + 1) % game.players.length;

        game.emit('turn');

        var player = game.players[game.turn];
        var socket = game.sockets[player.id];

        if (socket) {
            socket.emit('turn', game.getDataForClient(player.id), game.turns[game.turns.length - 1].getDataForClient());
        }
    }
}

module.exports = GameFlow;