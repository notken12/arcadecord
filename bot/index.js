const { ShardingManager } = require('discord.js');
const express = require('express');

// load .env that will be used for all processes running shard managers
require('dotenv').config({
    path: './bot/.env'
});

//load config for this specific process
var processId = process.argv[2];

const config = require('./config/' + processId + '.json');

var shardList = config.shardList.map(id => Number(id));
var port = config.port;
var totalShards = Number(process.env.TOTAL_SHARDS);

// load balancing for tasks that can be done on any shard
var shardIndex = 0;

function getShardByRoundRobin() {
    shardIndex = (shardIndex + 1) % totalShards;
    return shardList[shardIndex];
}

// create sharding manager
const manager = new ShardingManager('./bot/bot.js', {
    token: process.env.BOT_TOKEN,
    shardList: shardList,
    totalShards: totalShards
});

console.log("Starting shard manager " + processId + " with " + shardList.length + " shards out of " + totalShards + " total shards");

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();

// create http server to handle requests
var app = express();

app.use(authMiddleware);

function authMiddleware(req, res, next) {
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('Access denied. No token provided.');
        return;
    }
    if (!authHeader.startsWith('Bearer ')) {
        res.status(401).send('Access denied. Invalid token.');
        return;
    }

    // Remove Bearer from string
    var token = authHeader.slice(7, authHeader.length);

    if (token !== process.env.GAME_SERVER_TOKEN) {
        res.status(401).send('Access denied. Invalid token.');
        return;
    }

    next();
}

app.post('/message/start', (req, res) => {
    console.log("Received message start request");
});

app.get('/users/:id', (req, res) => {
    console.log("Received user request for " + req.params.id);
    var shard = getShardByRoundRobin();
    manager.broadcastEval(c => {
        var user = c.users.fetch(req.params.id);
        return user;
    }, { shard: shard }).then(users => {
        var user = users.find(u => u);
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).send("User not found");
        }
    });
});

app.listen(port, () => console.log(`Bot host ${processId} listening on port ${port}`));