// auth.controller.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import fetch from 'node-fetch';
import { fetchUser, fetchUserFromAccessToken } from '../utils/discord-api.js';
import JWT from 'jsonwebtoken';
import db from '../../db/db2.js';

const tenYears = 1000 * 60 * 60 * 24 * 365 * 10;

function generateAccessToken(id) {
  return JWT.sign(
    {
      id: id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: tenYears,
    }
  );
}

export default async (req, res) => {
  try {
    const error = req.query.error;
    const errorDescription = req.query.error_description;
    if (
      error === 'access_denied' &&
      errorDescription ===
        'The resource owner or authorization server denied the request'
    ) {
      res.send(
        `Whoops, looks like you've denied Arcadecord access to your account. If this is a mistake, please go back and try again.<br>
<a href="/sign-in">Back</a>
`
      );
      return;
    }
    const code = req.query.code;

    const params = new URLSearchParams();
    params.append('client_id', process.env.BOT_CLIENT_ID);
    params.append('client_secret', process.env.BOT_CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', process.env.WEB_SERVER_URL + '/auth');

    const options = {
      method: 'POST',
      body: params,
    };

    //send post request
    let body = await fetch(
      'https://discord.com/api/oauth2/token',
      options
    ).catch((error) => {
      console.error(error);
      res.status(500).send('500: Internal Server Error');
    });
    var data = await body.json();

    var refresh_token = data.refresh_token;
    var access_token = data.access_token;

    var discordUser = await fetchUserFromAccessToken(access_token);
    if (!discordUser) {
      console.log(
        'Could not get user from access token: Discord response data:'
      );
      console.log(data);
      console.log('Request sent with params:');
      console.log(params);
      res.send(
        `Error: could not get user from access token. Please report this bug on our discord server: https://arcadecord.com/discord-invite`
      );
      return;
    }

    // Discord user ID
    var dId = discordUser.id;

    // check if user exists

    var user = await db.users.getByDiscordId(dId);

    var existingUserId = user ? user._id : null;

    let type;
    let id;
    if (!existingUserId) {
      // new user
      id = (
        await db.users.create({
          discordId: dId,
          discordRefreshToken: refresh_token,
          discordAccessToken: access_token,
        })
      )._id;
      let token = generateAccessToken(id.toString());
      res.cookie('accessToken', token, {
        httpOnly: false,
        maxAge: tenYears,
      });
      type = 'new';
    } else {
      id = existingUserId;
      // existing user
      await db.users.update(id, {
        discordId: dId,
        discordRefreshToken: refresh_token,
        discordAccessToken: access_token,
      });
      let token = generateAccessToken(id.toString());
      res.cookie('accessToken', token, {
        httpOnly: false,
        maxAge: tenYears,
      });
      type = 'existing';
    }

    var cookie = req.cookies.gameId;
    if (cookie === undefined) {
      res.redirect('/signed-in');
    } else {
      res.redirect('/game/' + cookie);
    }
    return {
      type,
      id,
      discordId: dId,
    };
  } catch (e) {
    console.error(e);
    res.status(500).send('500: Internal Server Error');
  }
};
