import Common from './common.js'

import Game from '../../Game.js'

const options = {
  typeId: 'knockout',
  name: 'Knockout',
  description: "drown your friends lmao",
  aliases: ['boom', 'knockout'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '💥',
  data: {},
}

class KnockoutGame extends Game {
  constructor(config) {
    super(options, config)

    this.on('init', Game.eventHandlersDiscord.init)
    this.on('turn', Game.eventHandlersDiscord.turn)

    this.setActionModel('setDirections', Common.setDirections);
    this.setActionSchema('setDirections', {
        type: 'object',
        properties: {
            directions: { 
              type: 'array',
              maxItems:4,
              minItems:4, // [{x, y}, {x, y}, null, {x, y}] null = fallen
            },
        }
    });
  }

  async onInit(game) {
    spawn = await Common.spawn();
    game.data.ice = spawn.ice;
    game.data.dummies = spawn.dummies;
    return game
  }
}

export default {
  options,
  Game: KnockoutGame,
}
