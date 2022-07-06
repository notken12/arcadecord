// db2.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import crypto from 'crypto';

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  discordId: String,
  /*discordUser: Object,*/
  discordAccessToken: String,
  discordRefreshToken: String,
  joined: {
    type: Date,
    default: Date.now,
  },
  settings: {
    enableConfetti: {
      type: Boolean,
      default: true,
    },
  },
  banned: {
    type: Boolean,
    default: false,
  },
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    gamesWon: {
      type: Number,
      default: 0,
    },
    games: {
      type: Map,
      of: new Schema({
        gamesPlayed: {
          type: Number,
          default: 0,
        },
        gamesWon: {
          type: Number,
          default: 0,
        },
      }),
    },
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const gameSchema = new Schema({
  _id: String,
  typeId: String,
  name: String,
  description: String,
  image: String,
  aliases: [String],
  minPlayers: Number,
  maxPlayers: Number,
  players: Array,
  turn: Number,
  hasStarted: Boolean,
  hasEnded: Boolean,
  lastTurnInvite: String,
  startMessage: String,
  winner: Number,
  data: {
    type: Object,
    default: {},
    required: true,
  },
  previousData: {
    type: Object,
    default: {},
    required: true,
  },
  secretData: Object,
  turns: Array,
  sockets: Object,
  channel: String,
  guild: String,
  invitedUsers: Array,
  inThread: Boolean,
  threadChannel: String,
  reservedSpot: String,
  lastModifiedDate: {
    type: Date,
    default: Date.now(),
  },
});

const Game = mongoose.models.Game || mongoose.model('Game', gameSchema);

const serverSchema = new Schema({
  _id: String,
  stats: {
    users: {
      type: Map,
      of: new Schema({
        gamesPlayed: {
          type: Number,
          default: 0,
        },
        gamesWon: {
          type: Number,
          default: 0,
        },
        games: {
          type: Map,
          of: new Schema({
            gamesPlayed: {
              type: Number,
              default: 0,
            },
            gamesWon: {
              type: Number,
              default: 0,
            },
          }),
        },
      }),
      default: new Map(),
    },
    games: {
      type: Map,
      of: new Schema({
        gamesPlayed: {
          type: Number,
          default: 0,
        },
      }),
      default: new Map(),
    },
  },
  gamesPlayed: {
    type: Number,
    default: 0,
  },
});

const Server = mongoose.models.Server || mongoose.model('Server', serverSchema);

const slashCommandOptionsSchema = new Schema({
  _id: String,
  invitedUsers: Array,
  inThread: Boolean,
  gameConfig: Object,
  typeId: String,
});

const SlashCommandOptions =
  mongoose.models.SlashCommandOptions ||
  mongoose.model('SlashCommandOptions', slashCommandOptionsSchema);

const db = {
  async connect(uri) {
    await mongoose.connect(uri ?? process.env.MONGODB_URI);
  },
  servers: {
    async incrementGamesPlayed(serverId) {
      try {
        let query = {};
        let prop = `gamesPlayed`;
        // inc the prop by 1
        query[prop] = 1;
        return await Server.findByIdAndUpdate(serverId, query, {
          upsert: true,
          setDefaultsOnInsert: true,
          new: true,
        });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async incrementGamesPlayedByUser(serverId, userId) {
      try {
        let query = {};
        let prop = `stats.users.${userId}.gamesPlayed`;
        // inc the prop by 1
        query[prop] = 1;
        return await Server.findByIdAndUpdate(serverId, query, {
          upsert: true,
          setDefaultsOnInsert: true,
          new: true,
        });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async incrementGamesWonByUser(serverId, userId) {
      try {
        let query = {};
        let prop = `stats.users.${userId}.gamesWon`;
        // inc the prop by 1
        query[prop] = 1;
        return await Server.findByIdAndUpdate(serverId, query, {
          upsert: true,
          setDefaultsOnInsert: true,
          new: true,
        });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async incrementGamesPlayedByUserByGame(serverId, userId, gameType) {
      try {
        let query = {};
        let prop = `stats.users.${userId}.games.${gameType}.gamesPlayed`;
        // inc the prop by 1
        query[prop] = 1;
        return await Server.findByIdAndUpdate(serverId, query, {
          upsert: true,
          setDefaultsOnInsert: true,
          new: true,
        });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async incrementGamesPlayedByGame(serverId, gameType) {
      try {
        let query = {};
        let prop = `stats.games.${gameType}.gamesPlayed`;
        // inc the prop by 1
        query[prop] = 1;
        return await Server.findByIdAndUpdate(serverId, query, {
          upsert: true,
          setDefaultsOnInsert: true,
          new: true,
        });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async incrementGamesWonByUserByGame(serverId, userId, gameType) {
      try {
        let query = {};
        let prop = `stats.users.${userId}.games.${gameType}.gamesWon`;
        // inc the prop by 1
        query[prop] = 1;
        return await Server.findByIdAndUpdate(serverId, query, {
          upsert: true,
          setDefaultsOnInsert: true,
          new: true,
        });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async create(data) {
      try {
        var newServer = new Server(data);
        console.log(data);
        return await newServer.save();
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async getById(id) {
      try {
        return await Server.findById(id);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async update(id, data) {
      try {
        return await Server.findByIdAndUpdate(id, data, {
          new: true,
        });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async delete(id) {
      try {
        return await Server.findByIdAndRemove(id);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
  },
  users: {
    getHash: function (token) {
      if (!token) {
        return null;
      }
      return crypto.createHash('sha256').update(token).digest('hex');
    },
    async create(data) {
      try {
        var newUser = new User(data);
        return await newUser.save();
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async getById(id) {
      try {
        return await User.findById(id);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async getByDiscordId(id) {
      try {
        return await User.findOne({ discordId: id });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async getByAccessToken(token) {
      try {
        if (!token) {
          return null;
        }
        return await User.findOne({ discordAccessToken: token });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async update(id, data) {
      try {
        return await User.findByIdAndUpdate(id, data, { new: true });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async incrementGamesPlayedForGameType(userId, gameType) {
      try {
        let query = {};
        let prop = `stats.games.${gameType}.gamesPlayed`;
        // inc the prop by 1
        query[prop] = 1;
        return await User.findByIdAndUpdate(userId, query, { new: true });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async incrementGamesPlayed(userId) {
      try {
        let query = {};
        let prop = `stats.gamesPlayed`;
        // inc the prop by 1
        query[prop] = 1;
        return await User.findByIdAndUpdate(userId, query, { new: true });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async incrementGamesWonForGameType(userId, gameType) {
      try {
        let query = {};
        let prop = `stats.games.${gameType}.gamesWon`;
        // inc the prop by 1
        query[prop] = 1;
        return await User.findByIdAndUpdate(userId, query, { new: true });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async incrementGamesWon(userId) {
      try {
        let query = {};
        let prop = `stats.gamesWon`;
        // inc the prop by 1
        query[prop] = 1;
        return await User.findByIdAndUpdate(userId, query, { new: true });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async delete(id) {
      try {
        return await User.findByIdAndRemove(id);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async generateAccessToken(id) {
      var user = await this.getById(id);

      if (!user) {
        return null;
      }

      // generate token
      var token = crypto.randomBytes(32).toString('hex');
      // hash token
      var hash = this.getHash(token);
      // update user with new token

      user.accessTokenHash = hash;
      await user.save();
      return token;
    },
  },
  games: {
    async create(data) {
      try {
        var newGame = new Game(data);
        newGame._id = data.id;
        return await newGame.save();
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async getById(id) {
      try {
        return await Game.findById(id);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async update(id, data) {
      try {
        return await Game.findByIdAndUpdate(
          id,
          {
            ...data,
            lastModifiedDate: mongoose.now(),
          },
          { new: true }
        );
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async delete(id) {
      try {
        return await Game.findByIdAndRemove(id);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
  },
  slashCommandOptions: {
    async create(data) {
      try {
        var newSlashCommandOptions = new SlashCommandOptions(data);
        return await newSlashCommandOptions.save();
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async getById(id) {
      try {
        return await SlashCommandOptions.findById(id);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async update(id, data) {
      try {
        return await SlashCommandOptions.findByIdAndUpdate(id, data, {
          new: true,
        });
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async delete(id) {
      try {
        return await SlashCommandOptions.findByIdAndRemove(id);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
  },
};

export default db;
