import { config } from 'dotenv'
import Player from './Player.js'
import Action from './Action.js'
import Turn from './Turn.js'
import cloneDeep from 'lodash.clonedeep'

import GameFlow from './GameFlow.js'
import BotApi from '../../bot/api.js'
import Emoji from '../../../Emoji.js'
import db from '../../../db/db2.js'
import {
  MessageAttachment,
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
  MessageButton,
} from 'discord.js'
import Ajv from 'ajv'

config()

const ajv = new Ajv()

class Game {
  // options schema
  // {
  //     "id": "",
  //     "name": "",
  //     "description": "",
  //     "image": "",
  //     "aliases": [],
  //     "players": [],
  //     "maxPlayers": 0,
  //     "minPlayers": 0,
  // }

  gameOptions = {} // options for the game like 8 ball/9 ball, basketball moving targets or not, etc

  constructor(typeOptions, options) {
    this.testing = false;

    this.id = null // will be set by the server index.js
    this.players = []
    this.eventHandlers = {}
    this.actionHandlers = {}
    this.turn = 1
    this.sockets = {}
    this.hasStarted = false
    this.hasEnded = false
    this.lastTurnInvite = null
    this.startMessage = null
    this.winner = null // will be set to player index
    this.data = {} // game position, scores, etc
    this.secretData = {} // data to be kept secret from players clients
    this.turns = [] // all past turns taken by players
    this.actionModels = {} // actions and their functions to manipulate the game, will be supplied by game type, and sent to client so client can emulate
    this.actionSchemas = {} // action data schemas to enforce. helps with debugging and protects against attacks
    this.previousData = {} // snapshot of game data before the last turn
    this.invitedUsers = [] // discord IDs of users that have been invited to join the game, reserved spots

    // async actionModel (action, game) {
    // action: information about action
    // game: game that the action takes place in, whether it be server or client model of game

    // manipulate game data, whether it be server or client data
    // return game, or false if action was unsuccesful
    // }
    this.serverActionModels = {}
    this.clientActionModels = {}

    this.io = null

    let game = this

    this.client = {
      eventHandlers: {},
      emit: function (event, ...args) {
        if (game.testing) return
        if (!this.eventHandlers[event]) return

        for (let callback of this.eventHandlers[event]) {
          callback(this, ...args)
        }
      },
      on: function (event, callback) {
        if (!this.eventHandlers[event]) this.eventHandlers[event] = []
        this.eventHandlers[event].push(callback)
      },
      getDataForClient: function () {
        return {
          eventHandlers: this.eventHandlers,
          emit: this.emit.toString(),
          on: this.on.toString(),
        }
      },
    } // event management, just for client. used for updating ui. copy of this can be found in client-framework.js

    Object.assign(this, cloneDeep(typeOptions || {})) // deep clone options so that options wont be changed when game is modified
    Object.assign(this, cloneDeep(options || {})) // deep clone options so that options wont be changed when game is modified

    if (this._id !== undefined && this._id !== null) {
      this.id = this._id
    }
    if (this.id !== undefined && this.id !== null) {
      this._id = this.id
    }

    this.turns.getDataForClient = function (userId) {
      var data = []
      for (let turn of this) {
        data.push(Turn.getDataForClient(turn, userId))
      }
      return data
    }
  }
  //methods
  test() {
    this.testing = true
  }
  setGuild(guild) {
    this.guild = guild
  }
  setChannel(channel) {
    this.channel = channel
  }
  setActionModel(action, model, side) {
    if (side == 'client') {
      this.clientActionModels[action] = model
    } else if (side == 'server') {
      this.serverActionModels[action] = model
    } else {
      this.actionModels[action] = model
    }
  }
  getURL() {
    return process.env.GAME_SERVER_URL + '/game/' + this.id
  }
  on(event, callback) {
    if (!this.eventHandlers[event]) this.eventHandlers[event] = []
    this.eventHandlers[event].push(callback)
  }
  onAction(action, callback) {
    if (!this.actionHandlers[action]) this.actionHandlers[action] = []
    this.actionHandlers[action].push(callback)
  }
  async emit(event, ...args) {
    if (this.testing) return
    if (!this.eventHandlers[event]) return

    for (let callback of this.eventHandlers[event]) {
      await callback(this, ...args)
    }
    return true
  }
  async handleAction(action) {
    action.playerIndex = this.getPlayerIndex(action.userId)

    let actionSchema = this.actionSchemas[action.type]
    if (actionSchema) {
      const validate = ajv.compile(actionSchema)
      const valid = validate(action.data)
      if (!valid) {
        if (this.testing) {
          throw new Error('Action data does not follow schema: ' + validate.errors)
        }
        console.warn('Action data does not follow schema: ' + validate.errors)
        return {
          success: false,
          message: 'Invalid action data',
        }
      }
    } else {
      console.warn(
        '\x1b[31m%s\x1b[0m',
        '[WARNING] Add action schema for action: "' +
        action.type +
        '" to game: "' +
        this.typeId +
        '" with game.setActionSchema(type, schema) to prevent attacks. (see https://www.npmjs.com/package/ajv)'
      )
    }

    if (this.hasEnded)
      return {
        success: false,
      }

    if (action.playerIndex == -1) {
      if (this.hasStarted == false) {
        await this.addPlayer(action.userId)
        action.playerIndex = this.getPlayerIndex(action.userId)

        await GameFlow.start(this)
      }
    }

    // It isn't your turn bruh
    if (this.turn !== action.playerIndex)
      return {
        success: false,
      }

    if (
      this.turns.length == 0 ||
      this.turns[this.turns.length - 1].playerIndex != action.playerIndex
    ) {
      // First action in a new turn

      // Take a snapshot of the game data
      this.previousData = cloneDeep(this.data)

      // Create a new turn
      this.turns.push(new Turn(action.playerIndex))
    }

    //add action to turn
    this.turns[this.turns.length - 1].actions.push(action)

    // run action
    var actionModel = this.actionModels[action.type]

    var actionResult = {}
    if (actionModel) {
      var successful = await actionModel(this, action)

      if (!successful) {
        // action failed

        return {
          success: false,
        }
      }

      var serverActionModel = this.serverActionModels[action.type]
      if (serverActionModel) {
        var previousData = cloneDeep(this.data)
        var response = await serverActionModel(this, action)

        if (!response) {
          // action failed

          return {
            success: false,
          }
        } else {
          if (typeof response[1] == 'object') {
            actionResult = response[1]
            actionResult.success = true
          } else {
            actionResult = {
              success: true,
              changes: this.getChanges(previousData, this.data), // changes between game data before and after action,
              game: this.getDataForClient(action.userId),
            }
          }
        }
      }
    } else {
      // action not found
      return {
        success: false,
        message: 'Action model not found',
      }
    }

    if (this.actionHandlers[action.type]) {
      for (let callback of this.actionHandlers[action.type]) {
        await callback(action)
      }
    }

    return actionResult
  }
  async addPlayer(id) {
    if (!(await this.canUserJoin(id))) return false

    var user = await db.users.getById(id)
    if (!user) return false

    var discordUser = await BotApi.fetchUser(user.discordId)
    var player = new Player(id, discordUser)

    this.players.push(player)
    this.emit('join', player)

    return true
  }
  mockPlayers(count) {
    if (!this.testing) {
      console.error(
        'Mocking players is only available in testing mode. Use game.test() to enable it.'
      )
      return
    }
    for (let i = 0; i < count; i++) {
      this.players.push({
        id: i,
        discordUser: {
          mock: true,
          id: 'xxxxxxxxxxx',
          tag: `player${i}#${i.toString().padStart(4, '0')}`,
        },
      })
    }
  }
  async init() {
    await this.onInit(this)
    await this.emit('init')
  }
  async onInit(game) {
    return game
  }
  async doesUserHavePermission(id) {
    var dbUser = await db.users.getById(id)
    if (!dbUser) return false

    var res = await BotApi.getUserPermissionsInChannel(
      this.guild,
      this.channel,
      dbUser.discordId
    )

    if (!res.ok) return false

    var error
    var perms = await res.json().catch(() => (error = true))

    if (error) return false

    // must have perms to use slash commands to join games
    if (!perms.USE_APPLICATION_COMMANDS) {
      return false
    }

    var freeSpaces = this.maxPlayers - this.players.length

    if (freeSpaces > this.invitedUsers.length) {
      // there are free spaces that an uninvited player can join into
      return true
    } else {
      // no more extra spaces for uninvited players, only invited users can join
      if (this.invitedUsers.includes(dbUser.discordId)) {
        return true
      }
    }
    return false
  }
  async canUserJoin(id) {
    if (!(await this.doesUserHavePermission(id))) return false
    if (this.isGameFull()) {
      this.emit('error', 'Game is full')
      return false
    }
    if (this.players.filter((player) => player.id === id).length > 0) {
      this.emit('error', 'Player already in game')
      return false
    }
    return true
  }
  async canUserSocketConnect(id) {
    if (this.isPlayerInGame(id)) {
      return true
    }

    if (this.isGameFull()) {
      this.emit('error', 'Game is full')
      return false
    }

    if (!(await this.doesUserHavePermission(id))) return false

    return true
  }
  isGameFull() {
    return this.players.length >= this.maxPlayers
  }
  isPlayerInGame(id) {
    return (
      this.players.filter((player) => player.id.toString() === id.toString())
        .length > 0
    )
  }
  getPlayerIndex(id) {
    return this.players.indexOf(
      this.players.find((player) => player.id.toString() === id.toString())
    )
  }
  isItUsersTurn(userId, index) {
    var i
    if (index !== undefined) {
      i = index
    } else {
      i = this.getPlayerIndex(userId)
    }
    return this.turn == i || (!this.hasStarted && !this.isGameFull() && i == -1)
  }
  setSocket(userId, socket) {
    // TODO: disconnect user's old socket if they have one
    this.sockets[userId] = socket
  }
  getSocket(userId) {
    return this.sockets[userId]
  }

  setIo(io) {
    this.io = io
  }

  broadcastToAllSockets(event, broadcastGame, ...args) {
    for (let key in this.sockets) {
      if (broadcastGame) {
        this.sockets[key].emit(event, this.getDataForClient(key), ...args)
      } else {
        this.sockets[key].emit(event, undefined, ...args)
      }
    }
  }

  getImage() { }

  getChanges(oldData, newData) {
    var changes = {}
    for (let key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = newData[key]
      }
    }
    return changes
  }

  setActionSchema(actionType, schema) {
    schema.additionalProperties = false
    this.actionSchemas[actionType] = schema
  }

  getDataForClient(userId) {
    var game = {
      id: this.id,
      name: this.name,
      description: this.description,
      image: this.image,
      aliases: this.aliases,
      players: this.players.map((player) =>
        Player.getDataForClient(player, userId)
      ),
      maxPlayers: this.maxPlayers,
      minPlayers: this.minPlayers,
      turn: this.turn,
      data: this.data,
      myIndex: this.getPlayerIndex(userId),
      hasStarted: this.hasStarted,
      turns: this.turns.getDataForClient(userId),
      client: this.client.getDataForClient(userId),
      actionModels: {},
      clientActionModels: {},
      winner: this.winner,
      hasEnded: this.hasEnded,
      typeId: this.typeId,
      previousData: this.previousData,
      actionSchemas: this.actionSchemas,
    }
    for (let key in this.actionModels) {
      game.actionModels[key] = this.actionModels[key].name
    }
    for (let key in this.clientActionModels) {
      game.clientActionModels[key] = this.clientActionModels[key].name
    }

    return game
  }

  getThumbnail() { }
}

Game.eventHandlersDiscord = {
  init: async function (game) {
    var gameCreator = game.players[0]
    //var gameCreatorUser = new Discord.User();
    //Object.assign(gameCreatorUser, gameCreator.discordUser);

    var content = ''

    for (let discordId of game.invitedUsers) {
      content += `<@${discordId}> `
    }

    var embed = new MessageEmbed()
      .setTitle(game.name)
      .setColor(game.color || '#0099ff')
      .setURL(game.getURL())
    /*.setAuthor({
            name: `<@${gameCreator.discordUser.id}>`,
            iconURL: `https://cdn.discordapp.com/avatars/${gameCreator.discordUser.id}/${gameCreator.discordUser.avatar}.webp?size=80`
        })*/
    /*.setFooter(
            `<@${gameCreator.discordUser.id}>`,
            `https://cdn.discordapp.com/avatars/${gameCreator.discordUser.id}/${gameCreator.discordUser.avatar}.webp?size=80`
        );*/

    if (game.invitedUsers.length > 0) {
      embed.setDescription(
        `${game.description}\n\n<@${gameCreator.discordUser.id}> invited you to this game!`
      )
    } else {
      embed.setDescription(
        `${game.description}\n\nJoin <@${gameCreator.discordUser.id}> in this game!`
      )
    }

    var startGameButton = new MessageButton()
      .setEmoji(Emoji.ICON_WHITE)
      .setLabel('Play')
      .setStyle('LINK')
      .setURL(game.getURL())

    var row = new MessageActionRow().addComponents([startGameButton])
    var message = { embeds: [embed], components: [row] }

    if (content.length > 0) {
      message.content = content
    }

    if (typeof game.getThumbnail == 'function') {
      var image = await game.getThumbnail()
      if (image) {
        console.log(image)
        const attachment = new MessageAttachment(image, 'thumbnail.png')

        embed.setImage(`attachment://thumbnail.png`)

        message.files = [attachment]
      }
    }

    var res = await BotApi.sendMessage(message, game.guild, game.channel)

    var msg = await res.json()
    game.startMessage = msg.id
    //console.log('start message: ' + game.startMessage);

    return game
  },
  turn: async function (game) {
    if (game.startMessage) {
      BotApi.deleteMessage(game.guild, game.channel, game.startMessage)
    }
    if (game.lastTurnInvite) {
      BotApi.deleteMessage(game.guild, game.channel, game.lastTurnInvite)
    }

    var lastPlayer = game.turns[game.turns.length - 1].playerIndex

    var m = {
      content: `${Emoji.ICON_ROUND} <@${game.players[lastPlayer].discordUser.id
        }>: *${game.emoji + ' ' || ''}${game.name}*`,
      allowedMentions: {
        parse: [],
      },
    }

    m.content = `${game.emoji || Emoji.ICON_ROUND}  **${game.name}**`

    await BotApi.sendMessage(m, game.guild, game.channel)

    var embed = new MessageEmbed()
      .setTitle(game.name)
      .setDescription(`${game.description}`)
      .setColor(game.color || '#0099ff')
      .setURL(game.getURL())

    var button = new MessageButton()
      .setEmoji(Emoji.ICON_WHITE)
      .setLabel('Play')
      .setStyle('LINK')
      .setURL(game.getURL())

    var row = new MessageActionRow().addComponents([button])

    var invite = {
      content: `Your turn, <@${game.players[game.turn].discordUser.id}>`,
      embeds: [embed],
      components: [row],
    }

    var image = await game.getThumbnail()
    if (image) {
      console.log(image)
      const attachment = new MessageAttachment(image, 'thumbnail.png')

      embed.setImage(`attachment://thumbnail.png`)

      invite.files = [attachment]
    }

    var res = await BotApi.sendMessage(invite, game.guild, game.channel)

    var msg = await res.json()
    game.lastTurnInvite = msg.id

    return game
  },
}

Game.thumbnailDimensions = {
  width: 400,
  height: 300,
}

export default Game
