// Common action models

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js';

class Cup {
    id // unique id
    color
    num
    out = false// true if the cup is out
    constructor(id, color, num, out) {
        this.id = id;
        this.color = color;
        this.num = num
        this.out = out || false;
    }
}

let exports = {
    Cup
}

export default exports