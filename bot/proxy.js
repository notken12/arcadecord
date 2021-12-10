// Proxy to load balance and proxy requests to the correct shard manager hosts
const express = require('express');
const proxy = require('http-proxy-middleware');

require('dotenv').config({
    path: './bot/.env'
});

const authMiddleware = require('./auth-middleware');

const arch = require('./config/architecture.json');

var port = arch.ipcApiPort;

var hostIndex = 0;
function getHostByRoundRobin() {
    var host = arch.hosts[hostIndex];
    hostIndex = (hostIndex + 1) % arch.hosts.length;
    return host;
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
    var host = arch.hosts.find(host => host.shardList.includes(shard_id));
    return host;
}

// create express app
const app = express();

app.use(express.json());

// authentication middleware
app.use(authMiddleware);

function proxyRoundRobin(req, res) {
    var host = getHostByRoundRobin();
    // forward request to host
    var options = {
        target: `http://${host.ip}:${host.port}`,
        logLevel: 'debug'
    };
    proxy(options)(req, res);
}

function onError(err, req, res) {
    console.log(err);
  }

function proxyByGuild(guildId, req, res) {
    var host = getHostByGuild(guildId);
    console.log(host);
    // forward request to host
    var options = {
        target: `http://${host.ip}:${host.port}`,
        logLevel: 'debug',
        onError: onError
    };
    console.log(options.target);
    proxy(options)(req, res);
    console.log('proxied');
}

app.get('/users/:id', (req, res) => {
    console.log('get user');
    proxyRoundRobin(req, res);
});

app.post('/message/start', (req, res) => {
    console.log('start message');
    proxyByGuild(req.body.game.guild, req, res);
});

app.listen(port, function() {
    console.log('Bot IPC proxy listening on port ' + port);
});