import fetch from 'node-fetch';
import db from '../../db/db2.js';
import BotApi from '../bot/api.js';


async function getNewAccessToken(dbUser) {
    var res = await fetch('https://discordapp.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${dbUser.discordRefreshToken}&client_id=${process.env.BOT_CLIENT_ID}&client_secret=${process.env.BOT_CLIENT_SECRET}`
    });
    var json = await res.json();
    var access_token = json.access_token;
    var refresh_token = json.refresh_token;

    await db.users.update(dbUser._id, {
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
        console.log("couldn't fetch user's @me");
        console.log(me);
        console.log('tried to fetch with access token: ' + access_token);
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

    if (id === undefined) {
        console.error('TODO: handle case where app is not authorized to access user\'s @me');
    }

    var user = await BotApi.fetchUser(id);

    return user;
}

export {
    fetchUser,
    fetchUserFromAccessToken
}