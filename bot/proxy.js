// proxy.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// Proxy to load balance and proxy requests to the correct shard manager hosts
import express, { json } from 'express';
import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();

import authMiddleware from './auth-middleware.js';

import { loadHostConfig } from './config.js';

const { hosts, port, totalShards } = loadHostConfig();

var hostIndex = 0;
function getHostByRoundRobin() {
  let host = hosts[hostIndex];
  hostIndex = (hostIndex + 1) % hosts.length;
  return host;
}

function getShardByGuild(guild_id) {
  let num_shards = totalShards;

  //https://discord.com/developers/docs/topics/gateway#sharding-sharding-formula
  let shard_id = (guild_id >>> 22) % num_shards;
  return shard_id;
}

function getHostByGuild(guildId) {
  // get the host that has the shards that the guild is on
  var shard_id = getShardByGuild(guildId);
  var host = hosts.find((host) => host.shardList.includes(shard_id));
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

  fetch(options.url, options)
    .then(async (response) => {
      // send response back
      res.status(response.status);
      res.set(Object.fromEntries(response.headers));

      var text = await response.text();
      res.send(text || '');
    })
    .catch((err) => {
      console.error(err);
      res.status(500);
      res.send('Internal Server Error');
    });
}

function proxyRoundRobin(req, res) {
  var host = getHostByRoundRobin();
  // forward request to host
  if (host) return forwardRequest(host, req, res);
  else {
    res.status(500).send('Internal Server Error');
  }
}

function proxyByGuild(guildId, req, res) {
  let host = getHostByGuild(guildId);
  // forward request to host
  if (host) return forwardRequest(host, req, res);
  else {
    res.status(404).send('Guild not found');
  }
}

app.get('/users/:id', (req, res) => {
  //console.log('get user');
  proxyRoundRobin(req, res);
});

app.post('/posttest', (req, res) => {
  //console.log('post test request');
  proxyRoundRobin(req, res);
});

app.get('/gettest', (req, res) => {
  //console.log('get test request');
  proxyByGuild(0, req, res);
});

app.post('/startmessage', (req, res) => {
  //console.log('post start message');
  proxyByGuild(req.body.game.guild, req, res);
});

app.post('/turninvite', (req, res) => {
  //console.log('post turn invite');
  proxyByGuild(req.body.game.guild, req, res);
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
