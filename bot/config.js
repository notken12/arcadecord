// config.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import architecture from './config/architecture.js';

export function loadHostConfig() {
  let { hosts, port, totalShards } = architecture;
  port = Number(process.env.BOT_PROXY_PORT ?? port);
  totalShards = Number(process.env.TOTAL_SHARDS ?? totalShards);
  return {
    hosts,
    port,
    totalShards,
  };
}
