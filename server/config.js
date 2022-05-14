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
  if (
    host.port == null ||
    host.name == null ||
    host.id == null ||
    host.webServerUrl == null
  ) {
    console.log(host);
    throw new Error(
      'Arcadecord: Host configuration has missing fields. Set them using the environment variables GAME_SERVER_HOST_PORT, GAME_SERVER_HOST_NAME, GAME_SERVER_HOST_ID, WEB_SERVER_URL. Or provide a host ID from server/config/architecture.js as an argument.'
    );
  }
  return host;
}
