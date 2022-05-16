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

const { botIpcUrl } = loadApiConfig();

const baseUrl = botIpcUrl;

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

function routeRoundRobin(path) {}

function routeByGuild(path, guild) {}

function getBaseUrl(guildId) {}

async function fetchUser(userId) {
  try {
    var url = baseUrl + '/users/' + userId;

    var options = {
      method: 'GET',
    };
    auth(options);

    return await (await fetch(url, options)).json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function sendStartMessage(game) {
  var url = baseUrl + '/startmessage';
  var data = {
    game: game,
  };

  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  auth(options);

  return fetch(url, options);
}

function sendTurnInvite(game) {
  var url = baseUrl + '/turninvite';
  var data = {
    game: game,
  };

  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  auth(options);

  return fetch(url, options);
}

function deleteMessage(guildId, channelId, messageId) {
  var url = baseUrl + '/message/' + guildId + '/' + channelId + '/' + messageId;

  var options = {
    method: 'DELETE',
  };
  auth(options);

  return fetch(url, options);
}

function getUserPermissionsInChannel(guildId, channelId, userId) {
  var url =
    baseUrl + '/permissions/' + guildId + '/' + channelId + '/' + userId;

  var options = {
    method: 'GET',
  };
  auth(options);

  return fetch(url, options);
}

export default {
  sendStartMessage,
  fetchUser,
  deleteMessage,
  getUserPermissionsInChannel,
  sendTurnInvite,
};
