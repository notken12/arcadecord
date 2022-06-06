// shard-manager-config.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

export function loadShardManagerConfig() {
  // Use environment variables
  let config = {
    port: Number(process.env.PORT),
    id: Number(
      process.env.POD_NAME.replace(process.env.SHARD_MANAGER_POD_PREFIX, '')
    ),
    totalShards: Number(process.env.TOTAL_SHARDS),
    shardManagerCount: Number(process.env.SHARD_MANAGER_COUNT),
    webServerUrl: process.env.WEB_SERVER_URL,
    gameServerUrl: process.env.VITE_GAME_SERVER_URL,
    gameServerToken: process.env.GAME_SERVER_TOKEN,
    gameServerUrlInternal: process.env.GAME_SERVER_URL_INTERNAL,
  };
  return config;
}
