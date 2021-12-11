const crypto = require('crypto');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: String,
    discordId: String,
    /*discordUser: Object,*/
    discordAccessToken: String,
    discordRefreshToken: String,
    accessTokenHash: String,
    joined: {
        type: Date,
        default: Date.now
    },
});

const User = mongoose.model('User', userSchema);

const gameSchema = new Schema({
    _id: String,
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
    data: Object,
    turns: Array,
    actionModels: Object, // point to function name in game actionmodels export
    serverActionModels: Object,
    clientActionModels: Object,
});

const Game = mongoose.model('Game', gameSchema);

const db = {
    connect() {
        mongoose.connect('mongodb://localhost:27017/');
    },
    users: {
        getHash: function (token) {
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
                // hash token
                var hash = this.getHash(token);
                return await User.findOne({ accessTokenHash: hash });
            } catch (e) {
                console.error(e);
                return null;
            }
        },
        async update(id, data) {
            try {
                return await User.findByIdAndUpdate(id, data);
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
            user.save();
            return token;
        }
    },
    games: {
        async create(data) {
            try {
                var newGame = new Game(data);
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
                return await Game.findByIdAndUpdate(id, data);
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
        }
    }



}

module.exports = db;