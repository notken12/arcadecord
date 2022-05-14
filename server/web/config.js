// config.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

export function loadWebHostConfig() {
  const host = {
    gameServerUrl: process.env.VITE_GAME_SERVER_URL,
    port: Number(process.env.PORT),
    id: process.env.WEB_HOST_ID,
    url: process.env.WEB_SERVER_URL,
    name: process.env.WEB_HOST_NAME,
    botClientId: Number(process.env.BOT_CLIENT_ID),
    discordServerInvite: process.env.DISCORD_SERVER_INVITE,
  };
  if (process.env.GAME_SERVER_PROXY_PORT != null) {
    host.gameServerProxyPort = Number(process.env.GAME_SERVER_PROXY_PORT);
  }
  if (
    host.id == null ||
    host.port == null ||
    host.gameServerUrl == null ||
    host.url == null ||
    host.name == null ||
    host.botClientId == null ||
    host.discordServerInvite == null
  ) {
    console.log(host);
    throw new Error(
      'Web host was missing configuration options. Set them with environment variables GAME_SERVER_URL, PORT, WEB_SERVER_URL, WEB_HOST_NAME, WEB_HOST_ID, BOT_CLIENT_ID, DISCORD_SERVER_INVITE'
    );
  }
  return host;
}
