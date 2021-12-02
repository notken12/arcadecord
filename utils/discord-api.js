const fetch = require('node-fetch');
const db = require('../db/db');


async function fetchUser(bot, id) {
    var user = await db.getUser(id);
    if (!user) {
        return null;
    }
    var access_token = user.get('access_token');

    return await fetchUserFromAccessToken(bot, access_token);
}

async function fetchUserFromAccessToken(bot, access_token) {
    
    var me = (await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${'Bearer'} ${access_token}`,
        },
    }).catch(err => {
        console.error("couldn't fetch user's @me");
        console.error(err);
        return null;
    }));

    me = await me.json();
    console.log(access_token);
    console.log(me);

    var id = me.id;
    console.log(id);

    var user = await bot.getUserProfile(id);

    return user;
}

module.exports = {
    fetchUser,
    fetchUserFromAccessToken
}