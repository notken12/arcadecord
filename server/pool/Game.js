import * as THREE from 'three'

import { Table } from './Table'
import { Ball } from './Ball'
import { CueBall } from './CueBall'
import { CueStick } from './CueStick'

function Game(scene) {
  this.scene = scene

  //create table
  this.table = new Table(scene)

  this.cueStick = new CueStick(scene)

  var apex = Table.LEN_Z / 4

  var zo = 2 * Ball.RADIUS * Math.cos(Math.PI / 6) //how far the balls are spaced apart on z axis

  this.balls = [
    new CueBall(scene),

    //first row
    new Ball(scene, 0, Ball.RADIUS, apex, '9ball'),

    //second row
    new Ball(scene, 1 * Ball.RADIUS, Ball.RADIUS, apex + zo, '7ball'),
    new Ball(scene, -1 * Ball.RADIUS, Ball.RADIUS, apex + zo, '12ball'),

    //third row
    new Ball(scene, 2 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo, '15ball'),
    new Ball(scene, 0 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo, '8ball'),
    new Ball(scene, -2 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo, '1ball'),

    //fourth row
    new Ball(scene, 3 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo, '6ball'),
    new Ball(scene, 1 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo, '10ball'),
    new Ball(scene, -1 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo, '3ball'),
    new Ball(scene, -3 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo, '14ball'),

    //fifth row
    new Ball(scene, 4 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo, '11ball'),
    new Ball(scene, 2 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo, '2ball'),
    new Ball(scene, 0 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo, '13ball'),
    new Ball(scene, -2 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo, '4ball'),
    new Ball(scene, -4 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo, '5ball'),
  ]
}

Game.prototype.setStickRotation = function (rot) {
  // radians
  this.cueStick.setRotation(rot)
}

Game.prototype.rotateStick = function (rot) {
  // radians
  this.cueStick.rotate(rot)
}

Game.prototype.tick = function (dt) {
  this.cueStick.tick(dt)
  this.balls.forEach((ball) => {
    ball.tick(dt)
  })
  this.table.tick(dt)
}

export { Game }
