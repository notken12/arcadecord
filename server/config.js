// config.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// get architecture from config
import architecture from './config/architecture.js';

export const { hosts } = architecture;

export function loadHostConfig() {
  const hostId = process.argv[2];
  const host = hosts.find((host) => host.id === hostId) || {};

  // Use environment vars for config
  host.port = Number(process.env.GAME_SERVER_HOST_PORT ?? host.port);
  host.name = process.env.GAME_SERVER_HOST_NAME ?? host.name;
  host.id = process.env.GAME_SERVER_HOST_ID ?? host.id;
  host.webServerUrl = process.env.WEB_SERVER_URL;
  host.totalShards = Number(process.env.TOTAL_SHARDS);
  host.shardManagerCount = Number(process.env.SHARD_MANAGER_COUNT);
  host.shardManagerPodAddress = process.env.SHARD_MANAGER_POD_ADDRESS;
  for (let prop in host) {
    if (host[prop] == null) {
      console.log(host);
      throw new Error(
        'Arcadecord: Host configuration has missing fields. See configuration.md for configuration help.'
      );
    }
  }
  return host;
}
