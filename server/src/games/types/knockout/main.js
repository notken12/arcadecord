import Common from './common.js'

import Game from '../../Game.js'

const options = {
  typeId: 'knockout',
  name: 'Knockout',
  description: 'drown your friends lmao',
  aliases: ['boom', 'knockout'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '<:knockout:956316584476049469>',
  data: {},
}

class KnockoutGame extends Game {
  constructor(config) {
    super(options, config)

    this.on('init', Game.eventHandlersDiscord.init)
    this.on('turn', Game.eventHandlersDiscord.turn)

    this.setActionModel('setDummies', Common.setDummies)
    this.setActionSchema('setDummies', {
      type: 'object',
      properties: {
        directions: {
          type: 'array',
          maxItems: 4,
          minItems: 4,
        },
      },
    })
  }

  onInit(game) {
    var spawn = Common.spawn()
    game.data.ice = spawn.ice
    game.data.dummies = spawn.dummies
    return game
  }
}

export default {
  options,
  Game: KnockoutGame,
}
