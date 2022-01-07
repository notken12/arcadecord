import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config('../../.env');

import config from './config.js';

const {ipcApiUrl} = config;

const baseUrl = ipcApiUrl;

function getAuthHeader() {
    return {
        Authorization: `Bearer ${process.env.BOT_IPC_API_TOKEN}`,
    };
}

function auth(options) {
    if (!options.headers) {
        options.headers = {};
    }
    options.headers.Authorization = getAuthHeader().Authorization;
}

function sendStartMessage(game) {
    var url = baseUrl + '/message/start';
    var data = {
        game: game,
    };

    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    auth(options);


    return fetch(url, options);
}

async function fetchUser(userId) {
    try {
        var url = baseUrl + '/users/' + userId;

        var options = {
            method: 'GET'
        };
        auth(options);
    
        return await (await fetch(url, options)).json();
    }
    catch(err) {
        console.error(err);
        return null;
    }
}

function sendPostTest() {
    var url = baseUrl + '/posttest';

    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: 'test',
            userId: 'test',
        }),
    };
    auth(options);

    return fetch(url, options);
}

function sendGetTest() {
    var url = baseUrl + '/gettest';

    var options = {
        method: 'GET',
    };
    auth(options);

    return fetch(url, options);
}

function sendMessage(message, guild, channel) {
    var url = baseUrl + '/message';
    var data = {
        guild: guild,
        channel: channel,
        message: message,
    };

    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    auth(options);

    return fetch(url, options);
}

function deleteMessage(guildId, channelId, messageId) {
    var url = baseUrl + '/message/' + guildId + '/' + channelId + '/' + messageId;

    var options = {
        method: 'DELETE',
    };
    auth(options);

    return fetch(url, options);
}

function getUserPermissionsInChannel(guildId, channelId, userId) {
    var url = baseUrl + '/permissions/' + guildId + '/' + channelId + '/' + userId;

    var options = {
        method: 'GET',
    };
    auth(options);

    return fetch(url, options);
}

export default {
    sendStartMessage,
    fetchUser,
    sendPostTest,
    sendGetTest,
    sendMessage,
    deleteMessage,
    getUserPermissionsInChannel
}