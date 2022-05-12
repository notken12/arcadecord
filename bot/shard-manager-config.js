// shard-manager-config.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import architecture from './config/architecture.js'

export function loadShardManagerConfig() {
  var hostId = process.argv[2];
  let hosts = architecture.hosts;
  let config = hosts.find((host) => host.id === hostId);
  let totalShards = architecture.totalShards;
  if (config == null) {
    // Use environment variables
    config = {
      port: Number(process.env.PORT),
      shardList: JSON.parse(process.env.SHARD_LIST).map(x => Number(x)),
      id: Number(process.env.SHARD_MANAGER_ID)
    }
  }
  if (process.env.TOTAL_SHARDS != null) {
    totalShards = Number(process.env.TOTAL_SHARDS)
  }
  return {
    config,
    totalShards,
    hosts
  }
}
