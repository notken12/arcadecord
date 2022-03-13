import Common from './common.js'

import Game from '../../Game.js'

const options = {
  typeId: 'knockout',
  name: 'Knockout',
  description: "Strategically eliminate the enemy's mogos.",
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

    //this.setActionModel('switchColors', Common.action_switchColors);
    //this.setActionSchema('switchColors', {
    //    type: 'object',
    //    properties: {
    //        targetColor: {
    //            type: 'number',
    //            maximum: Common.COLORS.length - 1,
    //            minimum: 0
    //        }
    //    }
    //});
  }

  onInit(game) {
    // TODO: Generate new board

    return game
  }
}

export default {
  options,
  Game: KnockoutGame,
}
