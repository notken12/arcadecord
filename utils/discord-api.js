const fetch = require('node-fetch');
const db = require('../db/db');

async function fetchUser(id) {
    var user = await db.getUser(id);
    if (!user) {
        return null;
    }
    var access_token = user.get('access_token');

    const userResult = await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${'Bearer'} ${access_token}`,
        },
    });
    return userResult.json();
}

async function fetchUserFromAccessToken(access_token) {

    const userResult = await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${'Bearer'} ${access_token}`,
        },
    });
    return userResult.json();
}

module.exports = {
    fetchUser,
    fetchUserFromAccessToken
}