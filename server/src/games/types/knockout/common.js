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

async function setDummies(game, action) {
  action.data.directions.forEach((setTo, index) => {
    if (setTo) {
      var i = index + !action.userId * 4
      game.data.dummies[i] = new Dummy(
        setTo.x,
        setTo.y,
        setTo.faceDir,
        i,
        setTo.moveDir,
        setTo.fallen
      )
    }
  })
  var winner = checkWinner(game)
  if (winner) await GameFlow.end(game, { winner });
}

function checkWinner(game) {
  var p1,
    p0,
    winner = undefined,
    cur
  for (var i = 0; i < game.data.dummies.length; i++) {
    cur = game.data.dummies[i]
    if (!cur.fallen) continue //stop for loop if hasn't fallen
    if (cur.playerIndex) p1++
    //player index is either 0 or 1
    else p0++
  }
  if (p1 == 4) winner = 1
  else if (p0 == 4) winner = 0
  else if (p1 == 4 && p0 == 4) winner = -1 // draw cause they can all fall
  return winner
}

function spawn() {
  var ice = new Ice(100)
  let dummies = []

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

export default { Ice, Dummy, setDummies, spawn }
