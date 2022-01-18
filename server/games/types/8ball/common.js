// Common action models

// Import GameFlow to control game flow
var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");

var GameFlow;

// tests if global scope is bound to window
if (!isBrowser()) {
    let { default: g } = await import('../../GameFlow.js');
    GameFlow = g;
} else {
    GameFlow = window.GameFlow;
}



var exports = {

}

export default exports;