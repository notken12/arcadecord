// Import common module for this game type
import Common from './common.js'
const { Table, Ball, CueBall } = Common

// Import Game class
import Game from '../../Game.js'

// Game options, required. Export as options
// README.md
const options = {
  typeId: '8ball',
  name: '8 Ball',
  description: 'Play classic 8 ball pool with your friends!',
  aliases: ['pool'],
  minPlayers: 2,
  maxPlayers: 2,
  emoji: '🎱',
  data: {},
}

// Game constructor, extends base Game class
// Don't forget to super(options);
class EightBallGame extends Game {
  constructor(config) {
    // Creates a game with the options
    // Required
    super(options, config) // Config is the options given by the user, and other things like the channel and guild

    this.on('init', Game.eventHandlersDiscord.init)
    this.on('turn', Game.eventHandlersDiscord.turn)
  }

  onInit(game) {
    var apex = Table.PLAY_AREA.LEN_Z / 4

    var xo = Ball.RADIUS * 1
    var zo = 2 * Ball.RADIUS * Math.cos(Math.PI / 6) //how far the balls are spaced apart on z axis

    var y = CueBall.DEFAULT_POSITION.y

    game.data.balls = [
      new CueBall(),

      //first row
      new Ball(0, y, apex, '9ball'),

      //second row
      new Ball(1 * xo, y, apex + zo, '7ball'),
      new Ball(-1 * xo, y, apex + zo, '12ball'),

      //third row
      new Ball(2 * xo, y, apex + 2 * zo, '15ball'),
      new Ball(0 * xo, y, apex + 2 * zo, '8ball'),
      new Ball(-2 * xo, y, apex + 2 * zo, '1ball'),

      //fourth row
      new Ball(3 * xo, y, apex + 3 * zo, '6ball'),
      new Ball(1 * xo, y, apex + 3 * zo, '10ball'),
      new Ball(-1 * xo, y, apex + 3 * zo, '3ball'),
      new Ball(-3 * xo, y, apex + 3 * zo, '14ball'),

      //fifth row
      new Ball(4 * xo, y, apex + 4 * zo, '11ball'),
      new Ball(2 * xo, y, apex + 4 * zo, '2ball'),
      new Ball(0 * xo, y, apex + 4 * zo, '13ball'),
      new Ball(-2 * xo, y, apex + 4 * zo, '4ball'),
      new Ball(-4 * xo, y, apex + 4 * zo, '5ball'),
    ]

    game.data.players = [
      {
        assignedPattern: null,
        chosenPocket: null,
      },
      {
        assignedPattern: null,
        chosenPocket: null,
      },
    ]

    return game
  }
}

export default {
  options,
  Game: EightBallGame,
}
