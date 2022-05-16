// config.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

export function loadApiConfig() {
  let config = {
    totalShards: Number(process.env.TOTAL_SHARDS),
    shardManagerCount: Number(process.env.SHARD_MANAGER_COUNT),
    shardManagerPodAddress: process.env.SHARD_MANAGER_POD_ADDRESS,
  };
  return config;
}
