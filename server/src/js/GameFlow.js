const GameFlow = {
    start(game) {
        //once first action has been made, start the game
        //first start and then handle first action
        game.hasStarted = true;
        game.client.emit('start');

    },
    end(game, result) {
        //end the game
        game.hasEnded = true;
        if (result.winner) {
            game.winner = result.winner;
        } else {
            // draw
            game.winner = -1;
        }
        
        game.client.emit('end', result);
    },
    endTurn(game) {
        if (game.hasEnded) return;


        game.turn = (game.turn + 1) % game.players.length;

        game.client.emit('turn');
    },
    isItMyTurn(game) {
        return !game.hasEnded && this.isItUsersTurn(game, game.myIndex);
    },
    isItUsersTurn(game, userIndex) {
        let i = userIndex;
        return game.turn == i || (!game.hasStarted && !game.isGameFull() && i == -1);
    },
    isGameFull(game) {
        return game.players.length >= game.maxPlayers;
    }
};

export default GameFlow;