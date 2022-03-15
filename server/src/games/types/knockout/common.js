import GameFlow from '../../GameFlow.js'

class Dummy {
    constructor(x, y, moveDir, faceDir, playerIndex, fallen) {
        this.x = x; //x and y relative to ice size
        this.y = y;
        this.moveDir = moveDir; //vector
        this.faceDir = faceDir; //angle
        this.playerIndex = playerIndex;
        this.fallen = fallen || false;
        this.sussy = "ඞ";
    }
}

class Ice {
    constructor(size) {
        this.size = size;
    }
}

async function setDirection(game, action) {

}

function spawn() {
    var ice = new Ice(100);
    dummies = [];
    //have to check if they collide with the other ones before they are pushed :/
    //GRRRRRRR ඞඞඞඞඞඞ
    for (var i = 0; i < 8; i++) {
        /*if (i < 4) { //player 1
            dummies.push(new Dummy(

            ))
        } else { //player 0

        }*/
    }
}

var exports = {Dummy, setDirection, spawn}

export default exports
