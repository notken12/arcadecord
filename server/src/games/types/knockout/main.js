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

import { fromRelative } from '../../../js/games/knockout/utils.js';

// Snippet to make __dirname available
// get __dirname
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

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
              x: { type: 'number' },
              y: { type: 'number' },
            },
            required: ['faceDir', 'fallen', 'moveDir', 'x', 'y'],
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

  async getThumbnail() {
    const { default: Canvas } = await import('canvas');
    const { REL_DUM_RADIUS, REL_ICE_SIZE } = Common;

    const canvas = Canvas.createCanvas(
      Game.thumbnailDimensions.width,
      Game.thumbnailDimensions.height
    );
    const ctx = canvas.getContext('2d');
    const BG_COLOR = '#1b89e3';

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mobile = false;
    const size = Math.min(canvas.width, canvas.height);
    const width = size;
    const height = size;
    const fullWidth = canvas.width;
    const fullHeight = canvas.height;

    // Get screen orientation
    const padding = width * 0.1;
    const dummyRadius = ((width - padding * 2) * REL_DUM_RADIUS) / REL_ICE_SIZE;

    const containerX = canvas.width / 2 - width / 2;
    const containerY = 0;

    const iceSrc = path.resolve(
      __dirname,
      '../../../public/assets/knockout/ice.svg'
    );
    const iceImg = await Canvas.loadImage(iceSrc);

    const blackPenguinSrc = path.resolve(
      __dirname,
      '../../../public/assets/knockout/blackpenguin.svg'
    );
    const blackPenguinImg = await Canvas.loadImage(blackPenguinSrc);

    const bluePenguinSrc = path.resolve(
      __dirname,
      '../../../public/assets/knockout/bluepenguin.svg'
    );
    const bluePenguinImg = await Canvas.loadImage(bluePenguinSrc);

    let iceSize = ((width - padding * 2) * this.data.ice.size) / 100;

    // Adjust it slightly cause the shadow pushes it up
    ctx.translate(containerX, containerY + 3);
    ctx.drawImage(
      iceImg,
      width / 2 - iceSize / 2,
      width / 2 - iceSize / 2,
      iceSize,
      iceSize
    );

    for (let dum of this.data.dummies) {
      if (dum.fallen) continue;
      ctx.save();
      // Draw penguin body
      var c = fromRelative(
        dum.x,
        dum.y,
        mobile,
        width,
        height,
        padding,
        this.data.ice.size
      );
      ctx.translate(c.x, c.y);
      ctx.rotate(dum.faceDir - Math.PI / 2);
      // ctx.arc(c.x, c.y, dummyRadius, 0, 2 * Math.PI);

      ctx.shadowColor = 'black';
      ctx.shadowBlur = dummyRadius * 0.3;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      let displayRadius = dummyRadius;

      let x = -displayRadius;
      let y = -displayRadius;
      let w = displayRadius * 2;
      let h = displayRadius * 2;

      if (dum.playerIndex === 0) {
        ctx.drawImage(blackPenguinImg, x, y, w, h);
      } else if (dum.playerIndex === 1) {
        ctx.drawImage(bluePenguinImg, x, y, w, h);
      }

      ctx.restore();
    }

    return canvas;
  }
}

export default {
  options,
  Game: KnockoutGame,
};
