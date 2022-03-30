// Game.spec.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { createTestingDb } from '../../../db/testdb.js'
import db from '../../../db/db2.js'
import {
  describe,
  test,
  beforeAll,
  afterEach,
  afterAll,
  it,
  expect,
} from 'vitest'

import { createGame } from '../../controllers/create-game.controller.js'
import { AddPlayerError } from './GameErrors.js'

const testdb = await createTestingDb()

beforeAll(async () => await testdb.connect())
afterEach(async () => await testdb.clearDatabase())
afterAll(async () => await testdb.closeDatabase())

function mockGameOptions() {
  return {
    typeId: 'filler',
    guild: 'xxxxxxxx',
    channel: 'xxxxxxxx',
    invitedUsers: [],
    inThread: false,
  }
}

async function mockUser(options) {
  let defaultOptions = {
    discordId: '1234567890',
    discordRefreshToken: '123abc',
    discordAccessToken: '321cba',
  }
  Object.assign(defaultOptions, options)
  return await db.users.create(defaultOptions)
}

describe('Game created when', () => {
  it('Is made by a non banned user', async () => {
    const user = await mockUser()
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
        },
        userId: user._id,
      },
      true // mark as testing
    )
    expect(game.players[0].id).toEqual(user._id)
  })
})

describe('Game not created when', () => {
  it('Is made by a banned user', async () => {
    const user = await mockUser({ banned: true })
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
        },
        userId: user._id,
      },
      true // mark as testing
    )
    expect(game).toBeFalsy()
  })
})

describe('User may not be added to a game if', () => {
  it('the game is full', async () => {
    const user1 = await mockUser()
    const user2 = await mockUser()
    const user3 = await mockUser()
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
        },
        userId: user1._id,
      },
      true // mark as testing
    )
    expect(await game.addPlayer(user2._id)).toEqual({
      ok: true,
    })
    expect(await game.addPlayer(user3._id)).toEqual({
      ok: false,
      error: AddPlayerError.GAME_FULL,
    })
  })
})

describe('User may connect to a game if', () => {
  it('another socket is contesting with them for the spot', async () => {
    const user1 = await mockUser()
    const user2 = await mockUser()
    const user3 = await mockUser()
    const game = await createGame(
      {
        options: {
          ...mockGameOptions(),
        },
        userId: user1._id,
      },
      true // mark as testing
    )
    game.setSocket(user2._id, 'socket1')
    expect(await game.canUserSocketConnect(user3._id)).toEqual({
      ok: true,
    })
    expect(game.isConnectionContested(user3._id)).toEqual(true)
  })
})
