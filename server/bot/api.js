// api.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import fetch from 'node-fetch';

import { loadApiConfig } from './config.js';

const config = loadApiConfig();

function getAuthHeader() {
  return {
    Authorization: `Bearer ${process.env.BOT_IPC_TOKEN}`,
  };
}

function auth(options) {
  if (!options.headers) {
    options.headers = {};
  }
  options.headers.Authorization = getAuthHeader().Authorization;
}

let currentManager = 0;
function routeRoundRobin(path, options) {
  let url = getBaseUrlRoundRobin() + path;
  auth(options);
  return fetch(url, options);
}

function routeByGuild(path, options, guildId) {
  let url = getBaseUrlByGuild(guildId) + path;
  auth(options);
  return fetch(url, options);
}

function getShardId(guildId) {
  return (guildId >>> 22) % config.totalShards;
}

function getShardManagerAddress(shard_manager_id) {
  return config.shardManagerPodAddress.replace('%ID%', shard_manager_id);
}

function getBaseUrlByGuild(guildId) {
  let shard_id = getShardId(guildId);
  let shard_manager_id = shard_id % config.shardManagerCount;
  return getShardManagerAddress(shard_manager_id);
}

function getBaseUrlRoundRobin() {
  let shard_manager_id = currentManager;
  currentManager = (currentManager + 1) % config.shardManagerCount;
  return getShardManagerAddress(shard_manager_id);
}

// Stateless (round robin)
async function fetchUser(userId) {
  try {
    let path = '/users/' + userId;

    var options = {
      method: 'GET',
    };

    return await (await routeRoundRobin(path, options)).json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Stateful (by guild, needs to be sent to right shard manager)
function sendStartMessage(game) {
  let guildId = game.guild;
  let path = '/startmessage';
  var data = {
    game,
  };

  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  return routeByGuild(path, options, guildId);
}

// Stateful
function sendTurnInvite(game) {
  let guildId = game.guild;
  let path = '/turninvite';
  let data = {
    game,
  };

  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  return routeByGuild(path, options, guildId);
}

// Stateful
function deleteMessage(guildId, channelId, messageId) {
  let path = '/message/' + guildId + '/' + channelId + '/' + messageId;

  var options = {
    method: 'DELETE',
  };

  return routeByGuild(path, options, guildId);
}

// Stateful
function getUserPermissionsInChannel(guildId, channelId, userId) {
  let path = '/permissions/' + guildId + '/' + channelId + '/' + userId;

  var options = {
    method: 'GET',
  };

  return routeByGuild(path, options, guildId);
}

export default {
  sendStartMessage,
  fetchUser,
  deleteMessage,
  getUserPermissionsInChannel,
  sendTurnInvite,
};
