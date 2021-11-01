const Sequelize = require('sequelize');
const { randomUUID } = require('crypto');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

const Tags = sequelize.define('tags', {
    id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true
    },
    refresh_token: Sequelize.STRING,
    access_token: Sequelize.STRING,
    date_created: Sequelize.DATE,
    discord_id: Sequelize.STRING,
});

//returns tag
async function getUser(id) {
    return await Tags.findOne({
        where: {
            id: id,
        },
    }).catch(function (error) {
        console.error(error);
        return null;
    });
}

async function createUser(refresh_token, access_token, discord_id) {
    return await Tags.create({
        id: randomUUID(),
        refresh_token: refresh_token,
        access_token: access_token,
        discord_id: discord_id,
        date_created: new Date(),
    }).catch(function (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error('That tag already exists.');
            return;
        }
        console.error(error);
    });

}

async function updateUser(id, refresh_token, access_token, discord_id) {
    return await Tags.update({
        refresh_token: refresh_token,
        access_token: access_token,
        discord_id: discord_id,
    }, {
        where: {
            id: id,
        },
    }).catch(function (error) {
        console.error(error);
        return false;
    });
}

var accessTokenCache = {};

async function getAccessToken(id) {
    if (accessTokenCache[id]) {
        return accessTokenCache[id];
    }
    var user = await getUser(id);
    if (user) {
        accessTokenCache[id] = user.access_token;
        return user.access_token;
    }
}

async function getUserFromDiscordId(id) {
    return await Tags.findOne({
        where: {
            discord_id: id,
        },
    }).catch(function (error) {
        console.error(error);
        return null;
    });
}

module.exports = {
    sequelize,
    Tags,
    getUser,
    createUser,
    getUserFromDiscordId,
    updateUser,
};