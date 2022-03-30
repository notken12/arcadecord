class Player {
  constructor(id, discordUser) {
    this.id = id
    this.discordUser = discordUser
  }
}

Player.getDataForClient = function (player, userId) {
  return {
    id: player.id,
    discordUser: player.discordUser,
  }
}

export default Player
