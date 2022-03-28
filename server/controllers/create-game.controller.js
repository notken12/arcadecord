import db from '../../db/db2.js'
// get architecture from config
import architecture from '../config/architecture.js'
import { gameTypes } from '../src/games/game-types.js'

const { hosts } = architecture

// get the current host info
const hostId = process.argv[2]
const host = hosts.find((host) => host.id === hostId)

// Create snowflake generator
import { Generator } from 'snowflake-generator'
const SnowflakeGenerator = new Generator(946684800000, hosts.indexOf(host))

function toBase62(n) {
  if (n === 0) {
    return '0'
  }
  var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var result = ''
  while (n > 0) {
    result = digits[n % digits.length] + result
    n = parseInt(n / digits.length, 10)
  }

  return result
}

export default async (req, res) => {
  try {
    // get token from headers
    var authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).send('Access denied. No token provided.')
      return
    }
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).send('Access denied. Invalid token.')
      return
    }
    // Remove Bearer from string
    var token = authHeader.slice(7, authHeader.length)

    if (token !== process.env.GAME_SERVER_TOKEN) {
      res.status(401).send('Access denied. Invalid token.')
      return
    }

    // get game options
    let game = await createGame(req.body)

    if (!game) {
      console.log('User not authorized')
      res.status(401).send('User not authorized')
      return
    }
    game = await db.games.create(game)

    res.json(game)
  } catch (e) {
    console.error(e)
    res.status(500).send('Internal Server Error')
  }
}

export async function createGame(reqBody, testing) {
  let { options, userId } = reqBody
  var typeId = options.typeId

  // get game constructor
  var Game = gameTypes[typeId].Game

  var game = new Game(options)
  if (testing) {
    game.test()
  }

  // Set game ID
  var snowflake = SnowflakeGenerator.generate()
  var snowflakeNum = Number(snowflake)
  game.id = toBase62(snowflakeNum)

  // add player to game
  var user = await db.users.getById(userId)
  if (!user) return false
  if (user.banned) return false

  await game.addPlayer(user._id)
  await game.init()

  return game
}
