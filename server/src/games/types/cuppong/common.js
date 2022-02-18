// Common action models

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';

class Cup {
    id // unique id
    color
    rowNum // The row of the cup. The end of the table is row 0.
    rowPos // The position of the cup in the row, ascending from left to right (relative to the end of the table). The middle of the row is 0. For the rows with an even amount of cups, the left cup -0.5, the right cup 0.5.
    out = false // true if the cup is out
    constructor(id, color, rowNum, rowPos, out) {
        this.id = id;
        this.color = color;
        this.rowNum = rowNum;
        this.rowPos = rowPos;
        this.out = out || false;
    }
}

// Action data: a Vector3 force of the throw
// and the id of the cup that was knocked down
async function action_throw(game, action) {
    //TODO: Rearrange cups when possible

    // The player gets two throws
    // If the player does not make both throws, the turn ends
    // Otherwise, the player gets their balls back and get two more throws
    // And on until the player doesn't make both throws

    // When the player finishes knocking over all the opponent's cups, their turn ends
    // On the next turn, the opponent gets a redemption turn and if they knock over a cup, their last cup comes back into play and the game continues
    // If they fail the redemption, they lose the game

    let hitCupID = action.data.knockedCup;
    let opponentSide = game.data.sides[[1, 0][game.turn]]
    let opponentsCups = opponentSide.cups
    let thisSide = game.data.sides[game.turn]
    
    thisSide.ballsBack = false;

    if (!hitCupID) {
        thisSide.throwCount += 1;
        if (thisSide.inRedemption && thisSide.throwCount === 2) { //Failed Redemption
            await GameFlow.end(game, {
                winner: [1, 0][game.turn]
            })
        }
    } else {
        thisSide.throwCount += 1;
        thisSide.throwsMade += 1;
        let hitCup = opponentsCups.find(c => c.id === hitCupID);
        if (!hitCup) {
            return false
        }
        hitCup.out = true;
        opponentSide.lastKnocked = hitCupID;
        if (thisSide.inRedemption) {
            thisSide.cups.find(f => f.id === thisSide.lastKnocked).out = false;
            thisSide.inRedemption = false;
        }
        if (getCupsLeft(opponentsCups).length === 0) {
            opponentSide.inRedemption = true;
            await GameFlow.endTurn(game)
        }
        rearrangeCups(game)
    }

    if (thisSide.throwCount === 2) {
        if (thisSide.throwsMade !== 2) {
            await GameFlow.endTurn(game)
        }
        // Player hit both shots, balls back
        thisSide.ballsBack = true;
        thisSide.throwCount = 0;
        thisSide.throwsMade = 0;
    }


    return game
}
function getCupsLeft(cups) {
    var i;
    let cupsLeft = []
    for (i = 0; i < cups.length; i++) {
        if (!cups[i].out) {
            cupsLeft.push(cups[i])
        }
    }
    return cupsLeft;
}

function rearrangeCups(game) {
    let cupsLeft = getCupsLeft(game.data.sides[game.turn].cups)
    let opponentsCupsLeft = getCupsLeft(game.data.sides[[1, 0][game.turn]])

    if(cupsLeft.length === 6) {//Three Rows of Cups
        cupsLeft[0].rowNum = 3, cupsLeft[0].rowPos = 0;
        /////////////////////////////////////////////
        cupsLeft[1].rowNum = 2, cupsLeft[1].rowPos = -0.5;
        cupsLeft[2].rowNum = 2, cupsLeft[2].rowPos = 0.5;
        /////////////////////////////////////////////
        cupsLeft[3].rowNum = 1, cupsLeft[3].rowPos = 0;
        cupsLeft[4].rowNum = 1, cupsLeft[4].rowPos = -1;
        cupsLeft[5].rowNum = 1, cupsLeft[5].rowPos = 1;
    } else if(cupsLeft.length === 3){//Two Rows of Cups
        cupsLeft[0].rowNum = 3, cupsLeft[0].rowPos = 0;
        /////////////////////////////////////////////
        cupsLeft[1].rowNum = 2, cupsLeft[1].rowPos = -0.5;
        cupsLeft[2].rowNum = 2, cupsLeft[2].rowPos = 0.5;
    } else if(cupsLeft.length === 1){//One Cup
        cupsLeft[0].rowNum = 3, cupsLeft[0].rowPos = 0;
    }

    if(opponentsCupsLeft.length === 6) {//Three Rows of Cups
        opponentsCupsLeft[0].rowNum = 3, opponentsCupsLeft[0].rowPos = 0;
        /////////////////////////////////////////////
        opponentsCupsLeft[1].rowNum = 2, opponentsCupsLeft[1].rowPos = -0.5;
        opponentsCupsLeft[2].rowNum = 2, opponentsCupsLeft[2].rowPos = 0.5;
        /////////////////////////////////////////////
        opponentsCupsLeft[3].rowNum = 1, opponentsCupsLeft[3].rowPos = 0;
        opponentsCupsLeft[4].rowNum = 1, opponentsCupsLeft[4].rowPos = -1;
        opponentsCupsLeft[5].rowNum = 1, opponentsCupsLeft[5].rowPos = 1;
    } else if(opponentsCupsLeft.length === 3){//Two Rows of Cups
        opponentsCupsLeft[0].rowNum = 3, opponentsCupsLeft[0].rowPos = 0;
        /////////////////////////////////////////////
        opponentsCupsLeft[1].rowNum = 2, opponentsCupsLeft[1].rowPos = -0.5;
        opponentsCupsLeft[2].rowNum = 2, opponentsCupsLeft[2].rowPos = 0.5;
    } else if(opponentsCupsLeft.length === 1){//One Cup
        opponentsCupsLeft[0].rowNum = 3, opponentsCupsLeft[0].rowPos = 0;
    }
}

let exports = {
    Cup,
    action_throw,
    getCupsLeft,
    rearrangeCups
}

export default exports