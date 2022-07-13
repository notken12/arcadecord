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
  // Cryptographic hash of discordId (SHA256 Hex)
  _id: String,
  discordId: String,
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
  lastActive: {
    type: Date,
    default: Date.now,
    expires: 2592000,
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
    default: Date.now,
    expires: 259200, // 3 days
  },
});

const Game = mongoose.models.Game || mongoose.model('Game', gameSchema);

const slashCommandOptionsSchema = new Schema({
  _id: String,
  invitedUsers: Array,
  inThread: Boolean,
  gameConfig: Object,
  typeId: String,
  createdAt: {
    type: Date,
    expires: 600, //10 minutes
    default: Date.now,
  },
});

const SlashCommandOptions =
  mongoose.models.SlashCommandOptions ||
  mongoose.model('SlashCommandOptions', slashCommandOptionsSchema);

const getSha256 = (id) => {
  return crypto.createHash('sha256').update(id).digest('hex');
};

const db = {
  async connect(uri) {
    await mongoose.connect(uri ?? process.env.MONGODB_URI);
  },
  users: {
    getHash: function (token) {
      if (!token) {
        return null;
      }
      return getSha256(token);
    },
    async create(data) {
      try {
        const newUser = new User({
          ...data,
          // Cryptographic hash of Discord ID
          _id: getSha256(data.discordId),
        });
        return await newUser.save();
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async getById(id) {
      try {
        User.findByIdAndUpdate(id, {
          lastActive: mongoose.now(),
        });
        return await User.findById(id);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async getByDiscordId(id) {
      try {
        User.findByIdAndUpdate(getSha256(id), {
          lastActive: mongoose.now(),
        });
        return await User.findById(getSha256(id));
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
        return await User.findByIdAndUpdate(
          id,
          {
            ...data,
            lastActive: mongoose.now(),
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
