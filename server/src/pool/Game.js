import * as THREE from "three";

const Table = require('./Table').Table;
const Ball = require('./Ball').Ball;
const CueBall = require('./CueBall').CueBall;
const CueStick = require('./CueStick').CueStick;

function Game(scene, cannonWorld) {
    this.scene = scene;

    //create table
    this.table = new Table(scene, cannonWorld);

    this.cueStick = new CueStick(scene, cannonWorld);
    this.cannonWorld = cannonWorld;


    
    var apex = Table.LEN_Z / 4;
    
    var zo = 2*Ball.RADIUS*Math.cos(Math.PI/6); //how far the balls are spaced apart on z axis

    this.balls = [
        new CueBall(scene, cannonWorld),

        //first row
        new Ball(scene, cannonWorld, 0, Ball.RADIUS, apex, '9ball'),

        //second row
        new Ball(scene, cannonWorld, 1 * Ball.RADIUS, Ball.RADIUS, apex + zo, '7ball'),
        new Ball(scene, cannonWorld, -1 * Ball.RADIUS, Ball.RADIUS, apex + zo, '12ball'),

        //third row
        new Ball(scene, cannonWorld, 2 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo, '15ball'),
        new Ball(scene, cannonWorld, 0 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo, '8ball'),
        new Ball(scene, cannonWorld, -2 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo, '1ball'),

        //fourth row
        new Ball(scene, cannonWorld, 3 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo, '6ball'),
        new Ball(scene, cannonWorld, 1 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo, '10ball'),
        new Ball(scene, cannonWorld, -1 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo, '3ball'),
        new Ball(scene, cannonWorld, -3 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo, '14ball'),

        //fifth row
        new Ball(scene, cannonWorld, 4 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo, '11ball'),
        new Ball(scene, cannonWorld, 2 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo, '2ball'),
        new Ball(scene, cannonWorld, 0 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo, '13ball'),
        new Ball(scene, cannonWorld, -2 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo, '4ball'),
        new Ball(scene, cannonWorld, -4 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo, '5ball'),

    ];
}

Game.prototype.setStickRotation = function (rot) { // radians
    this.cueStick.setRotation(rot);
}

Game.prototype.rotateStick = function (rot) { // radians
    this.cueStick.rotate(rot);
}

Game.prototype.tick = function (dt) {
    this.cueStick.tick(dt);
    this.balls.forEach(ball => {
        ball.tick(dt);
    });
    this.table.tick(dt);
}

export {
    Game
}