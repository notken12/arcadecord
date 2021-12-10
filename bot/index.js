const { ShardingManager } = require('discord.js');
const express = require('express');

// load .env that will be used for all processes running shard managers
require('dotenv').config({
    path: './bot/.env'
});

//load config for this specific process
var processId = process.argv[2];

const authMiddleware = require('./auth-middleware');

const arch = require('./config/architecture.json');

const config = arch.hosts.find(host => host.id === processId);

var shardList = config.shardList.map(id => Number(id));
var port = config.port;
var totalShards = Number(arch.totalShards);

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
app.use(express.json());

app.use((req, res, next) => {
    console.log(req.path);
    next();
});

app.use(authMiddleware);


app.post('/message/start', (req, res) => {
    console.log("Received message start request");
    var game = req.body;
    console.log(game);
});

app.get('/users/:id', (req, res) => {
    console.log("Received user request for " + req.params.id);
    var shard = getShardByRoundRobin();
    manager.broadcastEval((c, { id }) => {
        var user = c.users.fetch(id);
        return user;
    }, { shard: shard, context: { id: req.params.id } }).then(users => {
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