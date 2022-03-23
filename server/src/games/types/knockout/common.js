import GameFlow from '../../GameFlow.js'

class Dummy { 
    constructor(x, y, faceDir, playerIndex, moveDir, fallen) {
        this.x = x; //x and y relative to ice size
        this.y = y;
        this.moveDir = moveDir || undefined; //vector
        this.faceDir = faceDir; //angle in degrees
        this.playerIndex = playerIndex;
        this.fallen = fallen || false;
        this.sussy = "ඞ";
    }
}

class Ice {
    static decrease = 5;
    constructor(size) {
        this.size = size;
    }
}

async function setDirections(game, action) {
    action.data.directions.forEach((direction, index) => {
        if (direction) {
            game.data.dummies[
                index + !action.userId * 4 //player 1's indexes are 0 to 3
            ].moveDir = direction;
        } else {
            game.data.dummies[index + !action.userId * 4 ].fallen = true
        }

    });
    await GameFlow.end(game, {winner:checkWinner(game)});
    var moving, fallen; //was gonna use arrays but numbers is faster
    for (var i = 0; i < game.data.dummies.length; i++) {
        cur = game.data.dummies[i]
        if (cur.moveDir != undefined) moving++;
        if (cur.fallen == true) fallen++;
    }
    if (moving == 8 - fallen) {
        // do not switch turns, push everything and decrease size
        // everything needs to be moved in client
        game.data.ice.size -= Ice.decrease;
    } else {
        await GameFlow.endTurn(game);
    }
}

function checkWinner(game) {
    var p1, p0, winner;
    for (var i = 0; i < game.data.dummies.length; i++) {
        cur = game.data.dummies[i]
        if (!cur.fallen) continue; //stop for loop if hasn't fallen
        if (cur.playerIndex) p1++; //player index is either 0 or 1
        else p0++;
    }
    if (p1 == 4) winner = 1; //p1
    else if (p0 == 4) winner = 0; //p2
    else if (p1 == 4 && p0 == 4) winner = -1; // draw cause they can all fall 
    return winner;

}

function spawn() {
    var ice = new Ice(100);
    dummies = [];

    
    //have to check if they collide with the other ones before they are pushed :/
    //GRRRRRRR ඞඞඞඞඞඞ
    //it's ok i'll fix it later maybe in the client


    for (var i = 0; i < 8; i++) {
        dummies.push( // don't want to have x or y be at the very edge of the ice
            new Dummy(randRange(10, 90), randRange(10, 90), randRange(0, 360), (i < 4) ? 1 : 0)
        );
    }
    return {ice, dummies};
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

export default {Ice, Dummy, setDirections, spawn}
