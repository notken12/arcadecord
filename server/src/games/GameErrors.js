export const GameConnectionError = {
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_NOT_STARTED: 'GAME_NOT_STARTED',
  GAME_FULL: 'GAME_FULL',
  DISCORD_UNAUTHORIZED: 'DISCORD_UNAUTHORIZED', // User doesn't have permission to use /commands in the channel that the game is in
  USER_NOT_FOUND: 'USER_NOT_FOUND',
}

export const CanUserJoinError = {
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_FULL: 'GAME_FULL',
  ALREADY_IN_GAME: 'ALREADY_IN_GAME',
}

export const AddPlayerError = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  DISCORD_USER_NOT_FOUND: 'DISCORD_USER_NOT_FOUND',
  GAME_FULL: 'GAME_FULL',
}
