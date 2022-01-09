import { ShardingManager } from 'discord.js';
import { MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } from 'discord.js';
import express, { json } from 'express';

// load .env that will be used for all processes running shard managers
import dotenv from 'dotenv';
dotenv.config({
    path: './bot/.env'
});

//load config for this specific host
var hostId = process.argv[2];

import authMiddleware from './auth-middleware.js';

import architecture from './config/architecture.js';

var totalShards = architecture.totalShards;
var hosts = architecture.hosts;

const config = hosts.find(host => host.id === hostId);


var shardList = config.shardList.map(id => Number(id));
var port = config.port;
var totalShards = Number(totalShards);

// load balancing for tasks that can be done on any shard
var shardIndex = 0;

function getShardByRoundRobin() {
    shardIndex = (shardIndex + 1) % totalShards;
    return shardList[shardIndex];
}

function getShardByGuild(guild_id) {
    var num_shards = totalShards;

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

console.log("Starting shard manager " + hostId + " with " + shardList.length + " shards out of " + totalShards + " total shards");

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();

// create http server to handle requests
var app = express();
app.use(json());

app.use((req, res, next) => {
    //console.log(req.path);
    next();
});

app.use(authMiddleware);

app.get('/users/:id', (req, res) => {
    //console.log("Received user request for " + req.params.id);
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

//test

app.post('/message', (req, res) => {
    var shard = getShardByGuild(req.body.guild);
    manager.broadcastEval(async (c, { channel, message }) => {
        try {
            return await c.channels.cache.get(channel).send(message);
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }, { shard: shard, context: { channel: req.body.channel, message: req.body.message } }).then((sentMessage => {
        res.send(sentMessage);
    }));
});

app.delete('/message/:guild/:channel/:message', (req, res) => {
    var shard = getShardByGuild(req.params.guild);
    manager.broadcastEval(async (c, { channel, message }) => {
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

app.get('/permissions/:guild/:channel/:user', (req, res) => {
    try {
        var shard = getShardByGuild(req.params.guild);
        manager.broadcastEval(async (c, { guild, channel, user }) => {
            var guild = await c.guilds.fetch(guild);

            var channel = await guild.channels.fetch(channel);

            if (!channel) return null;
            

            var members = guild.members;

            //get discord user id

            var member;

            try {
                member = await members.fetch(user);
            } catch (e) {
                console.error(e);
                console.log(user);
                return null;

            }

            if (!member) return null;

            const permissions = channel
                .permissionsFor(member).serialize();

            return permissions;
        }, { shard: shard, context: { guild: req.params.guild, channel: req.params.channel, user: req.params.user } }).then((permissions => {
            res.send(permissions);
        }));
    } catch (err) {
        console.error(err);
        res.status(500);
    }
});

app.listen(port, () => console.log(`Bot host ${hostId} listening on port ${port}`));