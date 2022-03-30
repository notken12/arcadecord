// auth.controller.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import fetch from 'node-fetch'
import { fetchUser, fetchUserFromAccessToken } from '../utils/discord-api.js'
import JWT from 'jsonwebtoken'
import db from '../../db/db2.js'

const tenYears = 1000 * 60 * 60 * 24 * 365 * 10

function generateAccessToken(id) {
  return JWT.sign(
    {
      id: id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: tenYears,
    }
  )
}

export default (req, res) => {
  try {
    const code = req.query.code

    const params = new URLSearchParams()
    params.append('client_id', process.env.BOT_CLIENT_ID)
    params.append('client_secret', process.env.BOT_CLIENT_SECRET)
    params.append('grant_type', 'authorization_code')
    params.append('code', code)
    params.append('redirect_uri', process.env.GAME_SERVER_URL + '/auth')

    const options = {
      method: 'POST',
      body: params,
    }

    //send post request
    fetch('https://discord.com/api/oauth2/token', options)
      .then(async (body) => {
        var data = await body.json()

        var refresh_token = data.refresh_token
        var access_token = data.access_token

        var discordUser = await fetchUserFromAccessToken(access_token)
        if (!discordUser) {
          res.send('Error: could not get user from access token')
          return
        }

        // Discord user ID
        var dId = discordUser.id

        // check if user exists

        var user = await db.users.getByDiscordId(dId)

        var existingUserId = user ? user._id : null

        if (!existingUserId) {
          // new user
          var id = (
            await db.users.create({
              discordId: dId,
              discordRefreshToken: refresh_token,
              discordAccessToken: access_token,
            })
          )._id
          let token = generateAccessToken(id.toString())
          res.cookie('accessToken', token, { httpOnly: true, maxAge: tenYears })
        } else {
          // existing user
          await db.users.update(existingUserId, {
            discordId: dId,
            discordRefreshToken: refresh_token,
            discordAccessToken: access_token,
          })
          let token = generateAccessToken(existingUserId.toString())
          res.cookie('accessToken', token, { httpOnly: true, maxAge: tenYears })
        }

        var cookie = req.cookies.gameId
        if (cookie === undefined) {
          res.send('logged in from sign in page, no game to redirect to')
        } else {
          res.redirect('/game/' + cookie)
        }
      })
      .catch((error) => {
        console.error(error)
        res.status(500).send('500: Internal Server Error')
      })
  } catch (e) {
    console.error(e)
    res.status(500).send('500: Internal Server Error')
  }
}
