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

    this.setActionModel('setDirection', Common.setDirection);
    this.setActionSchema('setDirection', {
        type: 'object',
        properties: {
            direction: { 
              type: 'object', 
              properties: {
                x: { type: 'number' },
                y: { type: 'number' }
              }
            },
            dummy: {
              type:'number',
              minimum:0,
              maximum:3
            }
        }
    });
  }

  onInit(game) {
    spawn = Common.spawn();
    game.data.ice = spawn.ice;
    game.data.dummies = spawn.dummies;
    return game
  }
}

export default {
  options,
  Game: KnockoutGame,
}
