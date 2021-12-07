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

const db = {
    connect() {
        mongoose.connect('mongodb://localhost:27017/');
    },
    async createUser(data) {
        try {
            var newUser = new User(data);
            return await newUser.save();
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    async getUserById(id) {
        try {
            return await User.findById(id);
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    async getUserByDiscordId (id) {
        try {
            return await User.findOne({discordId: id});
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    async getUserByAccessToken(token) {
        try {
            // hash token
            var hash = this.getHash(token);
            return await User.findOne({ accessTokenHash: hash });
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    async updateUser(id, data) {
        try {
            return await User.findByIdAndUpdate(id, data);
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    async deleteUser(id) {
        try {
            return await User.findByIdAndRemove(id);
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    async generateAccessToken (id) {
        var user = await this.getUserById(id);

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
    },
    getHash: function(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}

module.exports = db;