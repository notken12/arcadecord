var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");

var GameFlow;

// tests if global scope is bound to window
if(!isBrowser()) {
    GameFlow = await import('../../GameFlow.js');
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

export default exports;