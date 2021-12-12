// Proxy to load balance and proxy requests to the correct shard manager hosts
const express = require('express');
const httpProxy = require('http-proxy');
const fetch = require('node-fetch');

require('dotenv').config({
    path: './bot/.env'
});

const authMiddleware = require('./auth-middleware');

const arch = require('./config/architecture.json');

var port = arch.ipcApiPort;

// create proxy
const proxy = httpProxy.createProxyServer({});

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

function forwardRequest(host, req, res) {
    // forward request to host
    var options = {
        url: `http://${host.ip}:${host.port}${req.path}`,
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
    };

    if (options.method === 'GET') {
        options.body = undefined;
    }
    console.log('Proxying to ' + options.url);
    fetch(options.url, options).then(async response => {
        // send response back
        res.status(response.status);
        res.set(Object.fromEntries(response.headers));

        var text = await response.text();
        res.send(text || '');
    });
}

function proxyRoundRobin(req, res) {
    var host = getHostByRoundRobin();
    // forward request to host
    if (host)
        return forwardRequest(host, req, res);
}

function proxyByGuild(guildId, req, res) {
    var host = getHostByGuild(guildId);
    // forward request to host
    if (host)
        return forwardRequest(host, req, res);
}

app.get('/users/:id', (req, res) => {
    console.log('get user');
    proxyRoundRobin(req, res);
});

app.post('/message/start', (req, res) => {
    console.log('start message');
    proxyByGuild(req.body.game.guild, req, res);
});

app.post('/posttest', (req, res) => {
    console.log('post test request');
    proxyRoundRobin(req, res);
});

app.get('/gettest', (req, res) => {
    console.log('get test request');
    proxyByGuild(0, req, res);
});

app.post('/message', (req, res) => {
    console.log('post message');
    proxyByGuild(req.body.guild, req, res);
});

app.delete('/message/:guild/:channel/:message', (req, res) => {
    console.log('delete message');
    proxyByGuild(req.params.guild, req, res);
});

app.listen(port, function () {
    console.log('Bot IPC proxy listening on port ' + port);
});