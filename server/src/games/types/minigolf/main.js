// main.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Import common module for this game type
import Common from './common.js'; // <- ctrl+click to jump to this file

// Import Game class
import Game from '../../Game.js';

// Snippet to make __dirname available
// get __dirname
import path from 'path';
import { fileURLToPath } from 'url';
import { get } from 'http';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

// Game options, REQUIRED. Export as options
// see README.md
const options = {
  typeId: 'minigolf',
  name: 'Mini Golf',
  description: 'Play a game of golf with a friend',
  aliases: ['golf'],
  minPlayers: Infinity,
  maxPlayers: 2,
  emoji: '😁',
  data: {},
  hidden: true,
};

// Game constructor, extends base Game class
// Don't forget to super(options);
class Minigolf extends Game {
  constructor(config) {
    // Creates a game with the options
    // REQUIRED
    super(options, config); // Config is the options given by the user, and other things like the channel and guild

    // Use default Discord event handlers
    this.on('init', Game.eventHandlersDiscord.init);
    this.on('turn', Game.eventHandlersDiscord.turn);

    // Set the action model for the 'stroke' action
    // See common.js
    this.setActionModel('stroke', Common.stroke);
    // Set the action schema for the 'stroke' action
    // action.data will be checked against this schema
    // See https://ajv.js.org/
    this.setActionSchema('stroke', {
      type: 'object',
      properties: {
        force: {
          type: 'object',
          properties: {
            x: {
              type: 'number',
            },
            y: {
              type: 'number',
            },
          },
          required: ['x', 'y'],
        },
      },
      required: ['force'],
    });
  }

  // Use this function to create the game data
  onInit(game) {
    game.data.ball = {
      x: 0,
      y: 0,
    };
  }
}

// REQUIRED: export the options and the game class as Game
export default {
  options,
  Game: Minigolf,
};
