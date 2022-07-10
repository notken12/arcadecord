// Game.spec.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { createTestingDb } from '../../../db/testdb.js';
import db from '../../../db/db2.js';
import {
  describe,
  test,
  beforeAll,
  afterEach,
  afterAll,
  it,
  expect,
} from 'vitest';

import { createGame } from '../../controllers/create-game.controller.js';
import { AddPlayerError } from './GameErrors.js';
import GameFlow from './GameFlow.js';

const testdb = await createTestingDb();

beforeAll(async () => await testdb.connect());
afterEach(async () => await testdb.clearDatabase());
afterAll(async () => await testdb.closeDatabase());

function mockGameOptions() {
  return {
    typeId: 'filler',
    guild: 12345,
    channel: 12345,
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

describe('Personal stats', () => {
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
    expect(newUser1.stats.games.get(game.typeId).gamesPlayed).toBe(1);
    expect(newUser2.stats.games.get(game.typeId).gamesPlayed).toBe(1);

    expect(newUser1.stats.games.get(game.typeId).gamesWon).toBe(1);
    expect(newUser2.stats.games.get(game.typeId).gamesWon).toBe(0);
  });
});

describe('Server leaderboards', () => {
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

    //Track games played overall
    expect(server.stats.gamesPlayed).toBe(1);

    //Track games played overall, by game
    expect(server.stats.games.get(game.typeId).gamesPlayed).toBe(1);

    //Track games played and won overall, by user
    expect(server.stats.users.get(user1._id).gamesPlayed).toBe(1);
    expect(server.stats.users.get(user2._id).gamesPlayed).toBe(1);

    expect(server.stats.users.get(user1._id).gamesWon).toBe(1);
    expect(server.stats.users.get(user2._id).gamesWon).toBe(0);

    //Track specific game type by user
    expect(
      server.stats.users.get(user1._id).games.get(game.typeId).gamesPlayed
    ).toBe(1);
    expect(
      server.stats.users.get(user2._id).games.get(game.typeId).gamesPlayed
    ).toBe(1);

    expect(
      server.stats.users.get(user1._id).games.get(game.typeId).gamesWon
    ).toBe(1);
    expect(
      server.stats.users.get(user2._id).games.get(game.typeId).gamesWon
    ).toBe(0);
  });
});
