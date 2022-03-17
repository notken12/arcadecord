import GameFlow from '../../GameFlow.js'

class Dummy {
  constructor(x, y, faceDir, playerIndex, moveDir, fallen) {
    this.x = x //x and y relative to ice size
    this.y = y
    this.moveDir = moveDir || undefined //vector
    this.faceDir = faceDir //angle in degrees
    this.playerIndex = playerIndex
    this.fallen = fallen || false
    this.sussy = 'ඞ'
  }
}

class Ice {
  static decrease = 5
  constructor(size) {
    this.size = size
  }
}

async function setDirections(game, action) {
  action.data.directions.forEach((direction, index) => {
    if (direction) {
      game.data.dummies[
        index + !action.userId * 4 //player 1's indexes are 0 to 3
      ].moveDir = direction
    }
  })
  await checkWinner(game)
  var moving, fallen //was gonna use arrays but numbers is faster
  for (var i = 0; i < game.data.dummies.length; i++) {
    cur = game.data.dummies[i]
    if (cur.moveDir != undefined) moving++
    if (cur.fallen == true) fallen++
  }
  if (moving == 8 - fallen) {
    // do not switch turns, push everything and decrease size
    // everything needs to be moved in client
    game.data.ice.size -= Ice.decrease
  } else {
    await GameFlow.endTurn(game)
  }
}

async function checkWinner(game) {
  var p1fallen, p0fallen, winner
  for (var i = 0; i < game.data.dummies.length; i++) {
    cur = game.data.dummies[i]
    if (!cur.fallen) continue //stop for loop if hasn't fallen
    if (cur.playerIndex) p1fallen++
    //player index is either 0 or 1
    else p0fallen++
  }
  if (p1fallen == 4) winner = 1
  else if (p0fallen == 4) winner = 0
  else if (p1fallen == 4 && p0fallen) return 'draw' //??? draw?? how do i do that
  await GameFlow.end(game, { winner })
}

function spawn() {
  var ice = new Ice(100)
  dummies = []

  //have to check if they collide with the other ones before they are pushed :/
  //GRRRRRRR ඞඞඞඞඞඞ
  //it's ok i'll fix it later maybe in the client

  for (var i = 0; i < 8; i++) {
    dummies.push(
      // don't want to have x or y be at the very edge of the ice
      new Dummy(
        randRange(10, 90),
        randRange(10, 90),
        randRange(0, 360),
        i < 4 ? 1 : 0
      )
    )
  }
  return { ice, dummies }
}

function randRange(min, max) {
  return Math.random() * (max - min) + min
}

export default { Ice, Dummy, setDirections, spawn }
