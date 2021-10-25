const Ball = require('./Ball').Ball;
const Table = require('./Table').Table;

function CueBall(scene, cannonWorld, x, y, z) {
    Ball.call(this, scene, cannonWorld, x || CueBall.DEFAULT_POSITION.x, y || CueBall.DEFAULT_POSITION.y, z || CueBall.DEFAULT_POSITION.z, 'cueball', 0xffffff);
}

CueBall.DEFAULT_POSITION = {
    x: 0,
    y: Ball.RADIUS,
    z: Table.LEN_Z / 4 * -1
};

CueBall.prototype = Object.create(Ball.prototype);
CueBall.prototype.constructor = CueBall;

export { 
    CueBall 
};