// main.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import Common from './common.js';

import Game from '../../Game.js';

const options = {
  typeId: 'knockout',
  name: 'Knockout',
  description: 'drown your friends lmao',
  aliases: ['boom', 'knockout'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '<:knockout:956316584476049469>',
  data: {},
};

class KnockoutGame extends Game {
  constructor(config) {
    super(options, config);

    this.on('init', Game.eventHandlersDiscord.init);
    this.on('turn', Game.eventHandlersDiscord.turn);

    this.setActionModel('setDummies', Common.setDummies);
    this.setActionSchema('setDummies', {
      type: 'object',
      properties: {
        dummies: {
          type: 'array',
          maxItems: 8,
          items: {
            type: 'object',
            properties: {
              faceDir: {
                type: 'number',
              },
              fallen: {
                type: 'boolean',
              },
              moveDir: {
                type: ['object', 'null'],
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                },
                required: ['x', 'y'],
              },
              playerIndex: {
                type: 'number',
                maximum: 1,
                minimum: 0,
              },
              x: { type: 'number' },
              y: { type: 'number' },
            },
            required: ['faceDir', 'fallen', 'moveDir', 'playerIndex', 'x', 'y'],
          },
        },
        firing: {
          type: 'boolean',
        },
      },
      required: ['dummies', 'firing'],
    });
  }

  onInit(game) {
    var spawn = Common.spawn();
    game.data.ice = spawn.ice;
    game.data.dummies = spawn.dummies;
    game.data.firing = false;
    game.data.firstTurn = true;
    return game;
  }
}

export default {
  options,
  Game: KnockoutGame,
};
