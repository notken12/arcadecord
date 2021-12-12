var GameFlow = {
    start(game) {
        //once first action has been made, start the game
        //first start and then handle first action
        game.hasStarted = true;
        game.emit('start');
    
    },
    end(game, result) {
        // end the current turn
        this.endTurn(game);

        //end the game
        game.hasEnded = true;
        if (result.winner) {
            game.winner = result.winner;
        } else {
            // draw
            game.winner = -1;
        }


    
        game.emit('end', result);
    },
    endTurn(game) {
        if (game.hasEnded) return;


        game.turn = (game.turn + 1) % game.players.length;

        game.emit('turn');
    }
}

module.exports = GameFlow;