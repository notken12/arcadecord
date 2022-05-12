// config.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

export function loadApiConfig() {
  return {
    botIpcUrl: process.env.BOT_IPC_URL ?? 'http://localhost:2000',
  };
}
