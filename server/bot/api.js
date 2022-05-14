// api.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config('../../.env');

import { loadApiConfig } from './config.js';

import FormData from 'form-data';

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

function sendPostTest() {
  var url = baseUrl + '/posttest';

  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'test',
      userId: 'test',
    }),
  };
  auth(options);

  return fetch(url, options);
}

function sendGetTest() {
  var url = baseUrl + '/gettest';

  var options = {
    method: 'GET',
  };
  auth(options);

  return fetch(url, options);
}

function sendMessage(message, guild, channel) {
  var url = baseUrl + '/message';
  var data = {
    guild: guild,
    channel: channel,
    message: message,
  };

  const formData = new FormData();
  formData.append('guild', JSON.stringify(data.guild));
  formData.append('channel', JSON.stringify(data.channel));
  formData.append('message', JSON.stringify(data.message));

  const files = data.message.files;
  if (files) {
    for (var i = 0; i < files.length; i++) {
      formData.append('file' + i, files[i].attachment);
    }
  }

  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  };
  auth(options);

  return fetch(url, options);
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
  sendPostTest,
  sendGetTest,
  sendMessage,
  deleteMessage,
  getUserPermissionsInChannel,
  sendTurnInvite,
};
