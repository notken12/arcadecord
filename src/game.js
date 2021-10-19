
const Table = require('./Table').Table;
const Ball = require('./Ball').Ball;
const CueBall = require('./CueBall').CueBall;
const CueStick = require('./CueStick').CueStick;

function Game(scene) {
    this.scene = scene;
    this.table = new Table(scene);
    this.cueStick = new CueStick(scene);

    var apex = Table.LEN_Z / 4;
    var zo = 1.72; //how far the balls are spaced apart on x axis

    this.balls = [
        new CueBall(scene),

        //first row
        new Ball(scene, 0, Ball.RADIUS, apex, '9ball'),

        //second row
        new Ball(scene, 1 * Ball.RADIUS, Ball.RADIUS, apex + zo*Ball.RADIUS, '7ball'),
        new Ball(scene, -1 * Ball.RADIUS, Ball.RADIUS, apex + zo*Ball.RADIUS, '12ball'),

        //third row
        new Ball(scene, 2 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo*Ball.RADIUS, '15ball'),
        new Ball(scene, 0 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo*Ball.RADIUS, '8ball'),
        new Ball(scene, -2 * Ball.RADIUS, Ball.RADIUS, apex + 2 * zo*Ball.RADIUS, '1ball'),
        
        //fourth row
        new Ball(scene, 3 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo*Ball.RADIUS, '6ball'),
        new Ball(scene, 1 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo*Ball.RADIUS, '10ball'),
        new Ball(scene, -1 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo*Ball.RADIUS, '3ball'),
        new Ball(scene, -3 * Ball.RADIUS, Ball.RADIUS, apex + 3 * zo*Ball.RADIUS, '14ball'),

        //fifth row
        new Ball(scene, 4 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo*Ball.RADIUS, '11ball'),
        new Ball(scene, 2 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo*Ball.RADIUS, '2ball'),
        new Ball(scene, 0 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo*Ball.RADIUS, '13ball'),
        new Ball(scene, -2 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo*Ball.RADIUS, '4ball'),
        new Ball(scene, -4 * Ball.RADIUS, Ball.RADIUS, apex + 4 * zo*Ball.RADIUS, '5ball'),

    ];
}

export {
    Game
}