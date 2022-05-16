// ready.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

export default {
  name: 'ready',
  once: true,
  execute(_config, client) {
    client.user.setActivity('/play', { type: 'PLAYING' });
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
