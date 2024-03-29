// GameErrors.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

export const GameConnectionError = {
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_NOT_STARTED: 'GAME_NOT_STARTED',
  GAME_FULL: 'GAME_FULL',
  DISCORD_USER_UNAUTHORIZED: 'DISCORD_USER_UNAUTHORIZED', // User doesn't have permission to use /commands in the channel that the game is in
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_BANNED: 'USER_BANNED',
  DISCORD_USER_NOT_FOUND: 'DISCORD_USER_NOT_FOUND',
};

export const CanUserJoinError = {
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_FULL: 'GAME_FULL',
  ALREADY_IN_GAME: 'ALREADY_IN_GAME',
  NO_PERMISSION: 'NO_PERMISSION',
};

export const AddPlayerError = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  DISCORD_USER_NOT_FOUND: 'DISCORD_USER_NOT_FOUND',
  GAME_FULL: 'GAME_FULL',
  ALREADY_IN_GAME: 'ALREADY_IN_GAME',
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  NO_PERMISSION: 'NO_PERMISSION',
};

export const UserPermissionError = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_BANNED: 'USER_BANNED',
};
