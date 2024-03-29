// GameFlow.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

const GameFlow = {
  async start(game) {
    //once first action has been made, start the game
    //first start and then handle first action
    game.hasStarted = true;
    await game.emit('start');
  },
  async end(game, result) {
    //end the game
    game.hasEnded = true;
    if (result.winner !== undefined && result.winner !== null) {
      game.winner = result.winner;
    } else {
      // draw
      game.winner = -1;
    }
    game.turn = (game.turn + 1) % game.players.length;

    await game.emit('turn');
    await game.emit('end', result);
  },
  async endTurn(game, nextPlayer) {
    if (game.hasEnded) return;

    if (nextPlayer == undefined) {
      game.turn = (game.turn + 1) % game.players.length;
    } else {
      game.turn = nextPlayer;
    }

    await game.emit('turn');
  },
  isItMyTurn(game, ignoreGameEnd) {
    return (
      (!game.hasEnded || ignoreGameEnd) &&
      this.isItUsersTurn(game, game.myIndex)
    );
  },
  isItUsersTurn(game, userIndex) {
    let i = userIndex;
    return (
      game.turn == i || (!game.hasStarted && !this.isGameFull(game) && i == -1)
    );
  },
  isGameFull(game) {
    return game.players.length >= game.maxPlayers;
  },
};

export default GameFlow;
