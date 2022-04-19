// architecture.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

export default {
  hosts: [
    {
      id: '1',
      ip: 'localhost',
      port: 2001,
      shardList: [0],
    },
    {
      id: '2',
      ip: 'localhost',
      port: 2002,
      shardList: [1],
    },
  ],
  totalShards: 2,
  ipcApiPort: 2000,
};
