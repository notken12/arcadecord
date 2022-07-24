// config.ts - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

type HostConfig = {
  port: number;
  id: string;
  webServerUrl: string;
  totalShards: number;
  shardManagerCount: number;
  shardManagerPodAddress: string;
  topGgUrl: string;
  discordServerInvite: string;
  gameServerUrl: string;
  botClientId: string;
};

/** Load game server host's configuration from environment variables. See configuration.md for details. */
export function loadHostConfig() {
  // Use environment vars for config
  const host: HostConfig = {
    port: Number(process.env.GAME_SERVER_HOST_PORT),
    id: process.env.GAME_SERVER_HOST_ID,
    webServerUrl: process.env.WEB_SERVER_URL,
    totalShards: Number(process.env.TOTAL_SHARDS),
    shardManagerCount: Number(process.env.SHARD_MANAGER_COUNT),
    shardManagerPodAddress: process.env.SHARD_MANAGER_POD_ADDRESS,
    topGgUrl: process.env.TOP_GG_URL,
    discordServerInvite: process.env.DISCORD_SERVER_INVITE,
    gameServerUrl: process.env.GAME_SERVER_URL,
    botClientId: process.env.BOT_CLIENT_ID,
  };
  for (let prop in host) {
    if (host[prop] == null) {
      console.log(host);
      console.log(
        'Warning: Arcadecord: Host configuration has missing fields. See configuration.md for configuration help.'
      );
    }
  }
  return host;
}
