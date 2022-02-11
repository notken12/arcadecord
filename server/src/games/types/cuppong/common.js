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
function action_throw(game, action) {
    // The player gets two throws
    // If the player does not make both throws, the turn ends
    // Otherwise, the player gets their balls back and get two more throws
    // And on until the player doesn't make both throws
    
    // When the player finishes knocking over all the opponent's cups, their turn ends
    // On the next turn, the opponent gets a redemption turn and if they knock over a cup, their last cup comes back into play and the game continues
    // If they fail the redemption, they lose the game
}

let exports = {
    Cup,
    action_throw
}

export default exports