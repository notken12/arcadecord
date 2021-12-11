const fetch = require('node-fetch');
const db = require('../../db/db2');
const BotApi = require('../bot/api');


async function getNewAccessToken(dbUser) {
    var res = await fetch('https://discordapp.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${dbUser.discordRefreshToken}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`
    });
    var json = await res.json();
    var access_token = json.access_token;
    var refresh_token = json.refresh_token;

    await db.updateUser(dbUser.id, {
        discordAccessToken: access_token,
        discordRefreshToken: refresh_token
    });

    return access_token;
}

async function fetchUserMe(access_token) {
    var me = (await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${'Bearer'} ${access_token}`,
        },
    }).catch(err => {
        console.error("couldn't fetch user's @me");
        console.error(err);
        return null;
    }));

    return me;
}

async function fetchUser(id) {
    var user = await db.users.getById(id);
    if (!user) {
        return null;
    }
    var access_token = user.discordAccessToken;

    return await fetchUserFromAccessToken(access_token);
}

async function fetchUserFromAccessToken(access_token) {
    
    var me = await fetchUserMe(access_token);

    if (!me) {
        return null;
    }

    if (!me.ok) {
        // refresh access token
        console.log('refreshing access token');

        var dbUser = await db.users.getByAccessToken(access_token);
        if (!dbUser) {
            return null;
        }
        access_token = await getNewAccessToken(dbUser);
        me = await fetchUserMe(access_token);
    }

    me = await me.json();

    var id = me.id;

    var user = await BotApi.fetchUser(id);

    return user;
}

module.exports = {
    fetchUser,
    fetchUserFromAccessToken
}