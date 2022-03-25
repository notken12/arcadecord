import { createTestingDb } from './testdb.js'
import db from './db2.js'
import {
  describe,
  test,
  beforeAll,
  afterEach,
  afterAll,
  it,
  expect,
} from 'vitest'

import { createGame } from '../server/controllers/create-game.controller.js'

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

async function createUser(options) {
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
    const user = await createUser()
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
    const user = await createUser({ banned: true })
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
