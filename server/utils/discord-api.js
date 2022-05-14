// discord-api.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import fetch from 'node-fetch';
import db from '../../db/db2.js';
import BotApi from '../bot/api.js';

const serialize = function (obj) {
  let str = [];
  for (let p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  return str.join('&');
};

async function getNewAccessToken(dbUser) {
  // console.log(`using refresh token: ${dbUser.discordAccessToken}`)
  let queryString = serialize({
    client_id: process.env.BOT_CLIENT_ID,
    client_secret: process.env.BOT_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: dbUser.discordRefreshToken,
    scope: 'identify',
  });
  // console.log(queryString)

  let body = new URLSearchParams();
  body.append('client_id', process.env.BOT_CLIENT_ID);
  body.append('client_secret', process.env.BOT_CLIENT_SECRET);
  body.append('grant_type', 'refresh_token');
  body.append('refresh_token', dbUser.discordRefreshToken);
  // body.append('scope', 'identify email connections')
  body.append('redirect_uri', process.env.GAME_SERVER_URL + '/auth');

  // console.log(body)
  var res = await fetch('https://discord.com/api/v8/oauth2/token', {
    method: 'POST',
    // headers: {
    //   'Content-Type': 'application/x-www-form-urlencoded',
    // },
    body: body,
  });
  var json = await res.json();
  // console.log('refreshed response')
  // console.log(json)
  var access_token = json.access_token;
  var refresh_token = json.refresh_token;

  if (access_token === undefined || access_token === null) {
    return null;
  }

  await db.users.update(dbUser._id, {
    discordAccessToken: access_token,
    discordRefreshToken: refresh_token,
  });
  // console.log(
  //   `new refresh token: ${json.refresh_token}, access_token: ${json.access_token}`
  // )

  return access_token;
}

async function fetchUserMe(access_token) {
  var me = await fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${'Bearer'} ${access_token}`,
    },
  }).catch((err) => {
    console.error("couldn't fetch user's @me");
    console.error(err);
    return null;
  });

  return me;
}

async function fetchUser(id) {
  var user = await db.users.getById(id);
  if (!user) {
    return null;
  }
  var access_token = user.discordAccessToken;

  return await fetchUserFromAccessToken(access_token);
}

async function fetchUserFromAccessToken(access_token) {
  var me = await fetchUserMe(access_token);

  if (!me) {
    return null;
  }

  if (!me.ok) {
    console.log("couldn't fetch user's @me");
    // refresh access token
    console.log('refreshing access token');

    var dbUser = await db.users.getByAccessToken(access_token);
    if (!dbUser) {
      return null;
    }
    access_token = await getNewAccessToken(dbUser);

    if (!access_token) {
      return null;
    }
    me = await fetchUserMe(access_token);
  }

  me = await me.json();

  var id = me.id;

  if (id === undefined) {
    console.error(
      "TODO: handle case where app is not authorized to access user's @me"
    );
    return null;
  }

  var user = await BotApi.fetchUser(id);

  return user;
}

export { fetchUser, fetchUserFromAccessToken };
