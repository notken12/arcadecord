var GameFlow = {
    async start(game) {
        //once first action has been made, start the game
        //first start and then handle first action
        game.hasStarted = true;
        await game.emit('start');
    
    },
    async end(game, result) {
        //end the game
        game.hasEnded = true;
        if (result.winner) {
            game.winner = result.winner;
        } else {
            // draw
            game.winner = -1;
        }

        // end the current turn
        game.turn = (game.turn + 1) % game.players.length;
        
        await game.emit('turn');
        await game.emit('end', result);
    },
    async endTurn(game) {
        if (game.hasEnded) return;


        game.turn = (game.turn + 1) % game.players.length;

        await game.emit('turn');
    }
}

export default GameFlow;