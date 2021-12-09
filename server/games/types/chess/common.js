var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");

var GameFlow;

// tests if global scope is bound to window
if(!isBrowser()) {
    GameFlow = require('../../GameFlow.js');
} else {
    GameFlow = window.GameFlow;
}

function endTurn(game, action){
  GameFlow.endTurn(game)

  return game;
}

var exports = {
 endTurn
}

if (typeof(module) !== 'undefined') {
    module.exports = exports; // require()
} else {
    window.Common = exports; // global var
}
