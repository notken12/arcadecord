// Game.spec.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import {
  describe,
  test,
  beforeAll,
  afterEach,
  afterAll,
  it,
  expect,
} from 'vitest';

import { createTestingDb } from '../../../db/testdb.js';
import db from '../../../db/db2.js';
import Action from './Action.js';
import {
  GameConnectionError,
  CanUserJoinError,
  AddPlayerError,
  UserPermissionError,
  ActionError,
} from './GameErrors.js';

import { createGame } from '../../controllers/create-game.controller.js';
import GameFlow from './GameFlow.js';
import { check } from 'prettier';

const testdb = await createTestingDb();

beforeAll(async () => await testdb.connect());
afterEach(async () => await testdb.clearDatabase());
afterAll(async () => await testdb.closeDatabase());

function mockGameOptions() {
  return {
    typeId: 'filler',
    guild: 'xxxxxxxx',
    channel: 'xxxxxxxx',
    invitedUsers: [],
    inThread: false,
  };
}

async function mockUser(options) {
  let defaultOptions = {
    discordId: '1234567890',
    discordRefreshToken: '123abc',
    discordAccessToken: '321cba',
  };
  Object.assign(defaultOptions, options);
  return await db.users.create(defaultOptions);
}

describe('Game created when', () => {
  it('Is made by a non banned user', async () => {
    const user = await mockUser();
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
        },
        userId: user._id,
      },
      true // mark as testing
    );
    expect(game.players[0].id).toEqual(user._id);
  });
});

describe('Game not created when', () => {
  it('Is made by a banned user', async () => {
    const user = await mockUser({ banned: true });
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
        },
        userId: user._id,
      },
      true // mark as testing
    );
    expect(game).toBeFalsy();
  });
});

describe('User may not be added to a game if', () => {
  it('the game is full', async () => {
    const user1 = await mockUser();
    const user2 = await mockUser();
    const user3 = await mockUser();
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
        },
        userId: user1._id,
      },
      true // mark as testing
    );
    expect(await game.addPlayer(user2._id)).toEqual({
      ok: true,
    });
    expect(await game.addPlayer(user3._id)).toEqual({
      ok: false,
      error: AddPlayerError.GAME_FULL,
    });
  });
});

describe('User may connect to a game if', () => {
  it('another socket is contesting with them for the spot', async () => {
    const user1 = await mockUser();
    const user2 = await mockUser();
    const user3 = await mockUser();
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
        },
        userId: user1._id,
      },
      true // mark as testing
    );
    game.setSocket(user2._id, 'socket1');
    expect(await game.canUserSocketConnect(user3._id)).toEqual({
      ok: true,
    });
    expect(game.isConnectionContested(user3._id)).toEqual(true);
  });
});

describe.todo('Personal stats', () => {
  it('Total games played will increase after game end, total games won will increase for winner', async () => {
    const user1 = await mockUser();
    const user2 = await mockUser();
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
        },
        userId: user1._id,
      },
      true // mark as testing
    );

    expect(await game.addPlayer(user2._id)).toEqual({
      ok: true,
    });

    await GameFlow.end(game, { winner: 0 }); // first player wins
    expect(game.winner).toBe(0);
    expect(game.hasEnded).toBe(true);

    const newUser1 = await db.users.getById(user1._id);
    const newUser2 = await db.users.getById(user2._id);

    // Both players should have increased their games played stat
    expect(newUser1.stats.gamesPlayed).toBe(1);
    expect(newUser2.stats.gamesPlayed).toBe(1);

    // Only the winner (newUser1) should have increased their games won stat
    expect(newUser1.stats.gamesWon).toBe(1);
    expect(newUser2.stats.gamesWon).toBe(0);

    // Increase the stats for the specific game type too
    expect(newUser1.stats.gameTypes[game.typeId].gamesPlayed).toBe(1);
    expect(newUser2.stats.gameTypes[game.typeId].gamesPlayed).toBe(1);

    expect(newUser1.stats.gameTypes[game.typeId].gamesWon).toBe(1);
    expect(newUser2.stats.gameTypes[game.typeId].gamesWon).toBe(0);
  });
});

describe.todo('Server leaderboards', () => {
  it('Total games played will increase after game end, total games won will increase for winner', async () => {
    // Mock 2 users to play the game with
    const user1 = await mockUser();
    const user2 = await mockUser();

    // Create the mock game using player 1

    const game = await createGame(
      {
        options: { ...mockGameOptions() },
        userId: user1._id,
      },
      true
    ); // true means testing

    // Fake server id
    const serverId = mockGameOptions().guild;

    // Add the second player to the game

    expect(await game.addPlayer(user2._id)).toEqual({ ok: true });

    // Manually end the game and make player 1 win

    await GameFlow.end(game, { winner: 0 }); // first player wins
    expect(game.winner).toBe(0);
    expect(game.hasEnded).toBe(true);

    // Query the database for the server stats
    const server = await db.servers.getById(serverId);

    // Expect the new stats

    //Track games played and won overall
    expect(server.stats.user[user1._id].gamesPlayed).toBe(1);
    expect(server.stats.user[user2._id].gamesPlayed).toBe(1);

    expect(server.stats.user[user1._id].gamesWon).toBe(1);
    expect(server.stats.user[user2._id].gamesWon).toBe(0);

    //Track specific game type
    expect(server.stats.user[user1._id].games[game.typeId].gamesPlayed).toBe(1);
    expect(server.stats.user[user2._id].games[game.typeId].gamesPlayed).toBe(1);

    expect(server.stats.user[user1._id].games[game.typeId].gamesWon).toBe(1);
    expect(server.stats.user[user2._id].games[game.typeId].gamesWon).toBe(0);
  });
});

describe('3+ Player Lobby', () => {
  //User Leaves\
  //User Unreadies\
  //Owner Kicks\
  it('Lobby created', async () => {
    const user = await mockUser();
    const user2 = await mockUser();
    const user3 = await mockUser();
    const user4 = await mockUser();
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
          typeId: 'crazy8s',
        },
        userId: user._id,
      },
      true // mark as testing
    );
    game.minPlayers = 3;
    await game.init();
    expect(game.players.length).toBe(1);
    expect(game.players[0].ready).toBe(true);

    await game.addPlayer(user2._id);
    expect(game.players.length).toBe(2);
    expect(game.players[1].ready).toBe(false);

    await game.addPlayer(user3._id);
    expect(game.players.length).toBe(3);
    expect(game.players[2].ready).toBe(false);

    await game.readyPlayer(user2._id);
    expect(game.hasStarted).toBe(false);
    expect(game.ready).toBe(false);

    let test1 = new Action(
      'place',
      {
        index: 0,
      },
      user._id
    );
    expect(await game.canRunAction(test1)).toEqual({
      success: false,
      error: ActionError.ISNT_READY,
    });

    await game.readyPlayer(user3._id);
    expect(game.players[2].ready).toBe(true);
    expect(game.hasStarted).toBe(false);
    expect(game.ready).toBe(true);
    expect(game.turn).toBe(0);

    let test2 = new Action(
      'place',
      {
        index: 0,
      },
      user._id
    );
    let result = await game.canRunAction(test2);
    expect(result).toEqual(true);
  });

  it('Player gets kicked', async () => {
    const user0 = await mockUser();
    const user1 = await mockUser();
    const user2 = await mockUser();
    const user3 = await mockUser();
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
          typeId: 'crazy8s',
        },
        userId: user0._id,
      },
      true // mark as testing
    );
    game.minPlayers = 3;
    await game.init();
    await game.addPlayer(user1._id);
    expect(game.players.length).toBe(2);
    await game.readyPlayer(user1._id);

    expect(game.players[0].id).toEqual(user0._id);
    expect(await game.kickPlayer(user0._id, user1._id)).toBe(true); //Not index because having multiple kicks might start kicking incorrect players
    expect(game.players.length).toBe(1);
    expect(game.players[1]).toBe(undefined);
    expect(game.ready).toBe(false);

    await game.addPlayer(user2._id);
    expect(game.players.length).toBe(2);
    expect(game.ready).toBe(false);

    await game.addPlayer(user3._id);
    expect(game.players.length).toBe(3);
    await game.readyPlayer(user3._id);

    await game.readyPlayer(user2._id);
    expect(game.ready).toBe(true);
  });
  it('Player unreadies', async () => {
    const user0 = await mockUser();
    const user1 = await mockUser();
    const user2 = await mockUser();
    const user3 = await mockUser();
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
          typeId: 'crazy8s',
        },
        userId: user0._id,
      },
      true // mark as testing
    );
    game.minPlayers = 3;
    await game.init();
    await game.addPlayer(user1._id);
    await game.readyPlayer(user1._id);
    expect(game.players.length).toBe(2);

    await game.unReadyPlayer(user1._id);
    expect(game.players[1].ready).toBe(false);

    await game.addPlayer(user2._id);
    await game.readyPlayer(user2._id);
    expect(game.players.length).toBe(3);
    expect(game.ready).toBe(false);

    await game.addPlayer(user3._id);
    await game.readyPlayer(user3._id);
    expect(game.players.length).toBe(4);

    await game.readyPlayer(user1._id);
    expect(game.ready).toBe(true);
  });
  it('Player disconnects', async () => {
    const user0 = await mockUser();
    const user1 = await mockUser();
    const user2 = await mockUser();
    const user3 = await mockUser();
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
          typeId: 'crazy8s',
        },
        userId: user0._id,
      },
      true // mark as testing
    );
    game.minPlayers = 3;
    await game.init();
    await game.addPlayer(user1._id);
    await game.readyPlayer(user1._id);
    expect(game.players.length).toBe(2);

    await game.disconnectSocket(user1._id);
    // Readied players should not be removed on disconnection
    expect(game.players.length).toBe(2);

    await game.addPlayer(user2._id);
    await game.unReadyPlayer(user2._id);
    expect(game.players.length).toBe(3);
    expect(game.players[2].ready).toBe(false);
    await game.disconnectSocket(user2._id);
    // Unready players **should** be removed on disconnection
    expect(game.players.length).toBe(2);
    expect(game.ready).toBe(false);

    await game.addPlayer(user3._id);
    await game.readyPlayer(user3._id);
    expect(game.players.length).toBe(3);
    expect(game.ready).toBe(true);
  });
  it.todo('Owner forces game to start', async () => {});
});
