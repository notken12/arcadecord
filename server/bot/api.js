const fetch = require('node-fetch');

// get information about the bot cluster architecture
const arch = require('./architecture.json');

// index of host for round-robin load balancing
var hostIndex = 0;

function getAuthHeader() {
    return {
        Authorization: `Bearer ${process.env.BOT_IPC_API_TOKEN}`,
    };
}

function auth(body) {
    if (!body.headers) {
        body.headers = {};
    }
    body.headers.Authorization = getAuthHeader().Authorization;
}

function getShardByGuild(guild_id) {
    var num_shards = arch.totalShards;

    //https://discord.com/developers/docs/topics/gateway#sharding-sharding-formula
    var shard_id = (guild_id >> 22) % num_shards;
    return shard_id;
}

function getHostByGuild(guildId) {
    // get the host that has the shards that the guild is on
    var shard_id = getShardByGuild(guildId);
    var host = arch.hosts.find(host => host.shards.includes(shard_id));
    return host;
}

function getHostRoundRobin() {
    var host = arch.hosts[hostIndex];
    hostIndex = (hostIndex + 1) % arch.hosts.length;
    return host;
}

function sendStartMessage(game) {
    var host = getHostByGuild(game.guild);
    var url = `http://${host.ip}:${host.port}/message/start`;

    var data = {
        game: game,
    };

    var body = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    auth(body);

    return fetch(url, body);
}

function fetchUser(userId) {
    var host = getHostRoundRobin();
    var url = `http://${host.ip}:${host.port}/user/${userId}`;

    var body = {
        method: 'GET'
    };
    auth(body);

    return fetch(url, body);
}

module.exports = {
    sendStartMessage,
    fetchUser
}