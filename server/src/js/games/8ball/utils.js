import { CueBall } from './CueBall'
import { Ball } from './Ball'
import { Table } from './Table'

export function getBalls(scene, world) {
  var apex = Table.PLAY_AREA.LEN_Z / 4

  var xo = Ball.RADIUS * 1
  var zo = 2 * Ball.RADIUS * Math.cos(Math.PI / 6) //how far the balls are spaced apart on z axis

  var y = CueBall.DEFAULT_POSITION.y

  return [
    new CueBall(scene, world),

    //first row
    new Ball(scene, world, 0, y, apex, '9ball'),

    //second row
    new Ball(scene, world, 1 * xo, y, apex + zo, '7ball'),
    new Ball(scene, world, -1 * xo, y, apex + zo, '12ball'),

    //third row
    new Ball(scene, world, 2 * xo, y, apex + 2 * zo, '15ball'),
    new Ball(scene, world, 0 * xo, y, apex + 2 * zo, '8ball'),
    new Ball(scene, world, -2 * xo, y, apex + 2 * zo, '1ball'),

    //fourth row
    new Ball(scene, world, 3 * xo, y, apex + 3 * zo, '6ball'),
    new Ball(scene, world, 1 * xo, y, apex + 3 * zo, '10ball'),
    new Ball(scene, world, -1 * xo, y, apex + 3 * zo, '3ball'),
    new Ball(scene, world, -3 * xo, y, apex + 3 * zo, '14ball'),

    //fifth row
    new Ball(scene, world, 4 * xo, y, apex + 4 * zo, '11ball'),
    new Ball(scene, world, 2 * xo, y, apex + 4 * zo, '2ball'),
    new Ball(scene, world, 0 * xo, y, apex + 4 * zo, '13ball'),
    new Ball(scene, world, -2 * xo, y, apex + 4 * zo, '4ball'),
    new Ball(scene, world, -4 * xo, y, apex + 4 * zo, '5ball'),
  ]
}
