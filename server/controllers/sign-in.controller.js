// sign-in.controller.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

export default (req, res) => {
  res.redirect(
    'https://discord.com/api/oauth2/authorize?client_id=' +
      process.env.BOT_CLIENT_ID +
      '&redirect_uri=' +
      encodeURIComponent(process.env.GAME_SERVER_URL + '/auth') +
      '&response_type=code&scope=identify'
  );
};
