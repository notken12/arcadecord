// Proxy to load balance and proxy requests to the correct shard manager hosts
import express, { json } from 'express';
import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();

import authMiddleware from './auth-middleware.js';

import architecture from './config/architecture.js';

var {hosts, ipcApiPort, totalShards} = architecture;

var port = ipcApiPort;


var hostIndex = 0;
function getHostByRoundRobin() {
    var host = hosts[hostIndex];
    hostIndex = (hostIndex + 1) % hosts.length;
    return host;
}

function getShardByGuild(guild_id) {
    var num_shards = totalShards;

    //https://discord.com/developers/docs/topics/gateway#sharding-sharding-formula
    var shard_id = (guild_id >> 22) % num_shards;
    return shard_id;
}

function getHostByGuild(guildId) {
    // get the host that has the shards that the guild is on
    var shard_id = getShardByGuild(guildId);
    var host = hosts.find(host => host.shardList.includes(shard_id));
    return host;
}

// create express app
const app = express();

app.use(json());

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
    //console.log('Proxying to ' + options.url);
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
    //console.log('get user');
    proxyRoundRobin(req, res);
});

app.post('/message/start', (req, res) => {
    //console.log('start message');
    proxyByGuild(req.body.game.guild, req, res);
});

app.post('/posttest', (req, res) => {
    //console.log('post test request');
    proxyRoundRobin(req, res);
});

app.get('/gettest', (req, res) => {
    //console.log('get test request');
    proxyByGuild(0, req, res);
});

app.post('/message', (req, res) => {
    //console.log('post message');
    proxyByGuild(req.body.guild, req, res);
});

app.delete('/message/:guild/:channel/:message', (req, res) => {
    //console.log('delete message');
    proxyByGuild(req.params.guild, req, res);
});

app.get('/permissions/:guild/:channel/:user', (req, res) => {
    proxyByGuild(req.params.guild, req, res);
});

app.listen(port, function () {
    console.log('Bot IPC proxy listening on port ' + port);
});