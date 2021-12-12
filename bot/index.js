const { ShardingManager } = require('discord.js');
const { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } = require('discord.js');
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

function getShardByGuild(guild_id) {
    var num_shards = arch.totalShards;

    //https://discord.com/developers/docs/topics/gateway#sharding-sharding-formula
    var shard_id = (guild_id >> 22) % num_shards;
    return shard_id;
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

    var game = req.body.game;


    var shard = getShardByGuild(game.guild);

    



    /*manager.broadcastEval((c, { channel, message }) => {


        c.channels.cache.get(channel).send(message);

    }, { shard: shard, context: { channel: game.channel, message } }).then((sentMessage => {
        console.log(sentMessage);
    }));*/


    res.send('ok');
});

app.get('/users/:id', (req, res) => {
    console.log("Received user request for " + req.params.id);
    var shard = getShardByRoundRobin();
    manager.broadcastEval((c, { id }) => {
        var user = c.users.fetch(id);
        return user;
    }, { shard: shard, context: { id: req.params.id } }).then(users => {
        if (typeof users.find === 'function') {
            var user = users.find(user => user.id === req.params.id);
            if (user) {
                res.json(user);
            }
            else {
                res.status(404).send("User not found");
            }
        } else {
            if (users) {
                res.json(users);
            } else {
                res.status(404).send("User not found");
            }
        }


    });
});

app.post('/posttest', (req, res) => {
    console.log("Received post test request");
    res.send('ok');
});

app.get('/gettest', (req, res) => {
    console.log("Received get test request");
    res.send('ok');
});

app.post('/message', (req, res) => {
    console.log("Received message request");
    var shard = getShardByGuild(req.body.guild);
    manager.broadcastEval(async (c, { channel, message }) => {
        try {
            return await c.channels.cache.get(channel).send(message);
        } 
        catch(e) {
            console.log(e);
            return null;
        }
    }, { shard: shard, context: { channel: req.body.channel, message: req.body.message } }).then((sentMessage => {
        res.send(sentMessage);
    }));
});

app.delete('/message/:guild/:channel/:message', (req, res) => {
    console.log("Received message delete request");
    var shard = getShardByGuild(req.params.guild);
    manager.broadcastEval(async (c, { channel, message }) => {
        console.log(channel, message);
        var channel = await c.channels.fetch(channel);

        if (!channel) return null;

        var msg = await channel.messages.delete(message).catch(err => {
            //console.log(err);
            return null;
        });
        return msg;
    }, { shard: shard, context: { channel: req.params.channel, message: req.params.message } }).then((deletedMessage => {
        res.send(deletedMessage);
    }));
});

app.listen(port, () => console.log(`Bot host ${processId} listening on port ${port}`));