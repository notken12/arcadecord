import * as Client from '../client-framework.js';

var gameId = Client.utils.getGameId(window.location);

// Connect the socket to the server

Client.connect(gameId, connectionCallback);

var gameCanvas = document.getElementById("canvas");
gameCanvas.width = 600;
gameCanvas.height = 400;
var gameCanvasContext = gameCanvas.getContext("2d")
var piecesImages = document.getElementsByClassName("chessPieces")
function updateBoard(){
  var i;
  var j;
  for(i=0; i<8; i++){
    for(j=0; j<8; j++){
      if(board[i][j] == "P"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[0];
      }
      else if(board[i][j] == "N"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[1];
      }
      else if(board[i][j] == "B"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[2];
      }
      else if(board[i][j] == "R"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[3];
      }
      else if(board[i][j] == "Q"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[4];
      }
      else if(board[i][j] == "K"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[5];
      }
      else if(board[i][j] == "p"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[6];
      }
      else if(board[i][j] == "n"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[7];
      }
      else if(board[i][j] == "b"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[8];
      }
      else if(board[i][j] == "r"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[9];
      }
      else if(board[i][j] == "q"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[10];
      }
      else if(board[i][j] == "k"){
        window[files[j]+ranks[i]+"i"].color = piecesImages[11];
      }
      else {
        window[files[j]+ranks[i]+"i"].color = piecesImages[12]
      }
    }
  }
}
updateBoard()
