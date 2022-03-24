// Require the necessary discord.js classes
import { config } from 'dotenv'
import {
  MessageAttachment,
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
  MessageButton,
} from 'discord.js'

import { gameTypes } from '../server/src/games/game-types.js'
import Emoji from '../Emoji.js'

import { readdirSync } from 'fs'
import { Client, Collection, Intents } from 'discord.js'

import Canvas from 'canvas'
import Game from '../server/src/games/Game.js'

// connect to the database
import db from '../db/db2.js'
db.connect()

// .env is used for all shards
config()

// get __dirname
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename)

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
client.commands = new Collection()
client.selectMenus = new Collection()
client.buttons = new Collection()
client.gameTypes = gameTypes
client.Emoji = Emoji

// Register font for showing winner names
Canvas.registerFont(
  path.resolve(__dirname, './fonts/Work Sans/WorkSans-Bold.ttf'),
  { family: 'Work Sans' }
)

client.sendStartMessage = async function (g) {
  // get game type
  var gameType = gameTypes[g.typeId]

  // create instance of game
  const game = new gameType.Game(g)

  const channel = await client.channels.fetch(game.channel)

  var gameCreator = game.players[0]
  //var gameCreatorUser = new Discord.User();
  //Object.assign(gameCreatorUser, gameCreator.discordUser);

  var content = ''

  for (let discordId of game.invitedUsers) {
    content += `<@${discordId}> `
  }

  const message = await getInviteMessage(game)

  var embed = message.embeds[0]
  embed.setAuthor({
    name: `${gameCreator.discordUser.tag}`,
    iconURL: `https://cdn.discordapp.com/avatars/${gameCreator.discordUser.id}/${gameCreator.discordUser.avatar}.webp?size=32`,
  })

  if (game.invitedUsers.length > 0) {
    // embed.setDescription(
    //   `${game.description}\n\n<@${gameCreator.discordUser.id}> invited you to this game!`
    // )
    embed.setDescription(
      `<@${gameCreator.discordUser.id}> invited you to this game!`
    )
  } else {
    // embed.setDescription(
    //   `${game.description}\n\nJoin <@${gameCreator.discordUser.id}> in this game!`
    // )
  }

  if (content.length > 0) {
    message.content = content
  }

  return await channel.send(message)
}

client.sendTurnInvite = async function (g) {
  // get game type
  var gameType = gameTypes[g.typeId]

  // create instance of game
  const game = new gameType.Game(g)

  let channel

  let textChannel = await client.channels.fetch(game.channel)
  if (game.startMessage) {
    textChannel.messages.delete(game.startMessage).catch(() => {})
  }

  if (game.inThread) {
    if (!game.threadChannel) {
      let thread = await textChannel.threads.create({
        name: `${Emoji.JOYSTICK} ${game.name}`,
        autoArchiveDuration: 'MAX',
        reason: `Arcadecord game`,
        // startMessage: game.startMessage,
      })
      for (let player of game.players) {
        thread.members.add(player.discordUser.id)
      }
      channel = thread
    } else {
      channel = await client.channels.fetch(game.threadChannel)
    }
  } else {
    channel = textChannel
  }

  if (game.lastTurnInvite) {
    channel.messages.delete(game.lastTurnInvite).catch(() => {})
  }

  var lastPlayer = game.players[game.turns[game.turns.length - 1].playerIndex]

  var m = {
    content: `${Emoji.ICON_ROUND} <@${lastPlayer.discordUser.id}>: *${
      game.emoji + ' ' || ''
    }${game.name}*`,
    allowedMentions: {
      parse: [],
    },
  }

  m.content = `${game.emoji || Emoji.ICON_ROUND}  **${game.name}**`

  if (!game.resending) await channel.send(m)

  let invite = await getInviteMessage(game)
  invite.embeds[0].setTitle(`${game.emoji || ''}  ${game.name}`)
  if (!game.hasEnded) {
    invite.content = `Your turn, <@${game.players[game.turn].discordUser.id}>`
  } else {
    if (game.winner === -1) {
      invite.content = `It's a draw! <@${
        game.players[game.turn].discordUser.id
      }>`
    } else {
      if (game.winner === game.turn) {
        invite.content = `${Emoji.CHECK} You win! <@${
          game.players[game.turn].discordUser.id
        }>`
      } else {
        invite.content = `${Emoji.X} You lose! <@${
          game.players[game.turn].discordUser.id
        }>`
      }
    }
  }

  var embed = invite.embeds[0]
  embed.setAuthor({
    name: `${lastPlayer.discordUser.tag}`,
    iconURL: `https://cdn.discordapp.com/avatars/${lastPlayer.discordUser.id}/${lastPlayer.discordUser.avatar}.webp?size=32`,
  })

  return await channel.send(invite)
}

function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  return ctx
}

async function getInviteMessage(game) {
  var embed = new MessageEmbed()
    .setTitle(`${game.emoji || ''}  Let's play ${game.name}!`)
    // .setDescription(`${game.description}`)
    .setColor(game.color || '#5253f9')
    .setURL(game.getURL())

  var button = new MessageButton()
    .setEmoji(Emoji.ICON_WHITE)
    .setLabel('Play')
    .setStyle('LINK')
    .setURL(game.getURL())

  var row = new MessageActionRow().addComponents([button])

  var invite = {
    embeds: [embed],
    components: [row],
  }

  var canvas = await game.getThumbnail()
  let image
  if (canvas) {
    const ctx = canvas.getContext('2d')

    if (game.hasEnded) {
      if (game.winner === -1) {
        let drawOverlaySrc = path.resolve(
          __dirname,
          '../server/src/ui-images/thumbnail_draw_overlay.png'
        )
        let drawOverlay = await Canvas.loadImage(drawOverlaySrc)
        ctx.drawImage(drawOverlay, 0, 0, canvas.width, canvas.height)
      } else {
        let winOverlaySrc = path.resolve(
          __dirname,
          '../server/src/ui-images/thumbnail_win_overlay.png'
        )
        let winOverlay = await Canvas.loadImage(winOverlaySrc)
        ctx.drawImage(winOverlay, 0, 0, canvas.width, canvas.height)

        let winner = game.players[game.winner]

        ctx.font = '14px "Work Sans"'
        ctx.textAlign = 'center'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        ctx.shadowColor = 'transparent'

        let winMsg = `${winner.discordUser.tag} wins!`

        let bottom = 25
        let paddingX = 6
        let paddingY = 6

        let textBox = ctx.measureText(winMsg)
        let textBoxWidth = textBox.width + paddingX * 2
        let textBoxHeight =
          textBox.actualBoundingBoxAscent +
          textBox.actualBoundingBoxDescent +
          paddingY * 2
        let textBoxX = canvas.width / 2 - textBoxWidth / 2
        let textBoxY =
          canvas.height - textBoxHeight / 2 - bottom - paddingY * 0.8

        ctx.fillStyle = 'white'
        ctx.fillRect(textBoxX, textBoxY, textBoxWidth, textBoxHeight)

        ctx.fillStyle = 'black'
        ctx.fillText(winMsg, canvas.width / 2, canvas.height - bottom)
      }
    }

    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
    let overlaySrc = path.resolve(
      __dirname,
      '../server/src/ui-images/thumbnail_overlay.png'
    )
    let overlayImg = await Canvas.loadImage(overlaySrc)

    // ctx.antialias = 'subpixel'
    // ctx.imageSmoothingEnabled = true
    // ctx.patternQuality = 'best'

    ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height)

    image = canvas.toBuffer()
  } else {
    let canvas = new Canvas.Canvas(
      Game.thumbnailDimensions.width,
      Game.thumbnailDimensions.height
    )
    let ctx = canvas.getContext('2d')

    // ctx.antialias = 'subpixel'
    // ctx.imageSmoothingEnabled = true
    // ctx.patternQuality = 'best'

    let defaultThumbnailSrc = path.resolve(
      __dirname,
      '../server/src/ui-images/default_thumbnail.png'
    )
    let defaultThumbnailImg = await Canvas.loadImage(defaultThumbnailSrc)

    ctx.drawImage(defaultThumbnailImg, 0, 0, canvas.width, canvas.height)

    image = canvas.toBuffer()
  }

  const attachment = new MessageAttachment(image, 'thumbnail.png')

  embed.setImage(`attachment://thumbnail.png`)

  invite.files = [attachment]

  return invite
}

const eventFiles = readdirSync(__dirname + '/events').filter((file) =>
  file.endsWith('.js')
)

for (const file of eventFiles) {
  let { default: event } = await import(`./events/${file}`)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

const commandFiles = readdirSync(__dirname + '/commands').filter((file) =>
  file.endsWith('.js')
)
const selectMenuFiles = readdirSync(__dirname + '/select-menus').filter(
  (file) => file.endsWith('.js')
)
//get button files
const buttonFiles = readdirSync(__dirname + '/buttons').filter((file) =>
  file.endsWith('.js')
)

for (const file of commandFiles) {
  let { default: command } = await import(`./commands/${file}`)
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command)
}

for (const file of selectMenuFiles) {
  let { default: menu } = await import(`./select-menus/${file}`)
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.selectMenus.set(menu.data.name, menu)
}

//set buttons
for (const file of buttonFiles) {
  let { default: button } = await import(`./buttons/${file}`)
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.buttons.set(button.data.name, button)
}

client.login(process.env.BOT_TOKEN)
