const fetch = require('node-fetch');

require('dotenv').config('../../.env');

const config = require('./config.json');

const baseUrl = config.ipcApiUrl;

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

function fetchUser(userId) {
    var url = baseUrl + '/users/' + userId;

    var options = {
        method: 'GET'
    };
    auth(options);

    return fetch(url, options);
}

module.exports = {
    sendStartMessage,
    fetchUser
}