// index.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { ShardingManager } from 'discord.js';
import express from 'express';

// load .env that will be used for all processes running shard managers
import dotenv from 'dotenv';
dotenv.config();

import authMiddleware from './auth-middleware.js';

import { loadShardManagerConfig } from './shard-manager-config.js';

const { config, totalShards, hosts } = loadShardManagerConfig();

const shardList = config.shardList.map((id) => Number(id));
const port = config.port;

// load balancing for tasks that can be done on any shard
let shardIndex = 0;

function getShardByRoundRobin() {
  shardIndex = (shardIndex + 1) % totalShards;
  return shardList[shardIndex];
}

function getShardByGuild(guild_id) {
  var num_shards = totalShards;

  //https://discord.com/developers/docs/topics/gateway#sharding-sharding-formula
  var shard_id = (guild_id >>> 22) % num_shards;
  return shard_id;
}

// create sharding manager
const manager = new ShardingManager('./bot/bot.js', {
  token: process.env.BOT_TOKEN,
  shardList: shardList,
  totalShards: totalShards,
});

manager.on('shardCreate', (shard) => console.log(`Launched shard ${shard.id}`));

// create http server to handle requests
var app = express();

app.use(express.json()); // Used to parse JSON bodies

app.use((req, res, next) => {
  //console.log(req.path);
  next();
});

app.use(authMiddleware);

app.get('/users/:id', (req, res) => {
  //console.log("Received user request for " + req.params.id);
  let shard = getShardByRoundRobin();
  manager
    .broadcastEval(
      (c, { id }) => {
        var user = c.users.fetch(id);
        return user;
      },
      { shard: shard, context: { id: req.params.id } }
    )
    .then((users) => {
      if (typeof users.find === 'function') {
        var user = users.find((user) => user.id === req.params.id);
        if (user) {
          res.json(user);
        } else {
          res.status(404).send('User not found');
        }
      } else {
        if (users) {
          res.json(users);
        } else {
          res.status(404).send('User not found');
        }
      }
    })
    .catch((err) => {
      res.status(404).send('User not found');
    });
});

app.post('/posttest', (req, res) => {
  console.log('Received post test request');
  res.send('ok');
});

app.get('/gettest', (req, res) => {
  console.log('Received get test request');
  res.send('ok');
});

//test

app.post('/message', (req, res) => {
  let shard = getShardByGuild(req.body.guild);
  manager
    .broadcastEval(
      async (c, { channel, message }) => {
        try {
          return await c.channels.fetch(channel).send(message);
        } catch (e) {
          console.log(e);
          return null;
        }
      },
      {
        shard: shard,
        context: { channel: req.body.channel, message: req.body.message },
      }
    )
    .then((sentMessage) => {
      res.send(sentMessage);
    });
});

app.post('/startmessage', async (req, res) => {
  if (!req.body.game?.guild) {
    res.status(400).send('Missing guild');
    return;
  }
  let shard = getShardByGuild(req.body.game.guild);

  manager
    .broadcastEval(
      async (c, { game }) => {
        try {
          return await c.sendStartMessage(game);
        } catch (e) {
          console.log(e);
          return null;
        }
      },
      { shard: shard, context: { game: req.body.game } }
    )
    .then((sentMessage) => {
      res.send(sentMessage);
    });
});

app.post('/turninvite', async (req, res) => {
  let shard = getShardByGuild(req.body.guild);

  manager
    .broadcastEval(
      async (c, { game }) => {
        try {
          return await c.sendTurnInvite(game);
        } catch (e) {
          console.log(e);
          return null;
        }
      },
      { shard: shard, context: { game: req.body.game } }
    )
    .then((sentMessage) => {
      res.send(sentMessage);
    });
});

app.delete('/message/:guild/:channel/:message', (req, res) => {
  let shard = getShardByGuild(req.params.guild);

  manager
    .broadcastEval(
      async (c, { channel, message }) => {
        var channel = await c.channels.cache.get(channel);

        if (!channel) return null;

        var msg = await channel.messages.delete(message).catch((err) => {
          //console.log(err);
          return null;
        });
        return msg;
      },
      {
        shard: shard,
        context: { channel: req.params.channel, message: req.params.message },
      }
    )
    .then((deletedMessage) => {
      res.send(deletedMessage);
    });
});

app.get('/permissions/:guild/:channel/:user', (req, res) => {
  try {
    let shard = getShardByGuild(req.params.guild);

    manager
      .broadcastEval(
        async (c, { guild, channel, user }) => {
          try {
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
              return null;
            }

            if (!member) return null;

            const permissions = channel.permissionsFor(member).serialize();

            return permissions;
          } catch {
            return null;
          }
        },
        {
          shard: shard,
          context: {
            guild: req.params.guild,
            channel: req.params.channel,
            user: req.params.user,
          },
        }
      )
      .then((permissions) => {
        res.send(permissions);
      });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

app.listen(port, () =>
  console.log(`Bot host ${config.id} listening on port ${port}`)
);

console.log(
  'Starting shard manager ' +
    config.id +
    ' with ' +
    shardList.length +
    ' shards out of ' +
    totalShards +
    ' total shards'
);

manager.spawn();
