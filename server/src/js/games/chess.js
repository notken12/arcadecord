import * as Client from '../client-framework.js';

var gameId = Client.utils.getGameId(window.location);

// Connect the socket to the server

Client.connect(gameId, connectionCallback);
var board = [[],[],[],[],[],[],[],[]];
readFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
var gameCanvas = document.getElementById("canvas");
gameCanvas.width = 600;
gameCanvas.height = 400;
var chessBoard = true;
var gameCanvasContext = gameCanvas.getContext("2d")
var piecesImages = document.getElementsByClassName("chessPieces")
var canCastle = true;
var turn = true;
var opponent = 1;
var side = "white";
var previousMoves = [];
var files = "abcdefgh";
var otherFiles = "hgfedcba"
var ranks = "87654321";
var pieceValue = [1,3,3,5,9];
var piecesBlack = ["p", "n", "b", "r", "q", "k"]
var piecesWhite = ["P","N","B","R","Q", "K"]
var pointer = new component(0,0, "black", 0, 0, "menu")
var selectedSquare = ""
var selectedSquareMoves = [];
var selectedPromotionSquare = "";
var promotionMenuWhite = false;
var promotionMenuBlack = false;

var promoOutline = new component(154,154, "black", 123,123,"menu")
var promoBackground = new component(150,150,"white", 125, 125, "menu")
var promoWQ = new component(75,75, piecesImages[4], 125, 125, "stillimage")
var promoWR = new component(75,75,piecesImages[3], 125, 200, "stillimage")
var promoWN = new component(75,75,piecesImages[1], 200,125,"stillimage")
var promoWB = new component(75,75,piecesImages[2], 200,200,"stillimage")

var promoBQ = new component(75,75, piecesImages[10], 125, 125, "stillimage")
var promoBR = new component(75,75,piecesImages[9], 125, 200, "stillimage")
var promoBN = new component(75,75,piecesImages[7], 200,125,"stillimage")
var promoBB = new component(75,75,piecesImages[8], 200,200,"stillimage")

function generateFEN(){
var i;
var j;
var fen = "";
for(i=0; i<8; i++){
  for(j=0; j<8; j++){
    if(board[i][j] == ""){
      var l;
      var space=1;
      var pieceYet = false;
      for(l=0; l<8; l++){
        if(!pieceYet){
          if(board[i][j+1+l] == ""){
            space+=1;
          } else {
            pieceYet = true;
          }
        }
      }
      j+=space-1;
      fen=fen+space;
    } else {
      fen = fen+board[i][j];
    }
  }
  if(i != 7){
    fen = fen+"/";
}
}
return fen;
}
function readFEN(fen){
  var i;
  var j;
  fen=fen.split("/")
  for(i=0; i<fen.length; i++){
    var position = 0;
    for(j=0; j<fen[i].length; j++){
      if(fen[i][j]>-Infinity){
        var l;
        for(l=0;l<fen[i][j]; l++){
          board[i][position+l] = "";
        }
        position += parseInt(fen[i][j])
      } else{
        board[i][position] = fen[i][j]
        position+=1;
      }
    }
  }
}
function createBoard(){
  var i;
  var j;
  var color = "gainsboro";
  if(side == "white"){
  for(i=0; i<8; i++){
    for(j=0;j<8;j++){
      color = "white"
      if(Number.isInteger((i+j-1)/2)){
        color="gainsboro"
      }
      window[files[j]+ranks[i]] = new component(50,50,color,(50*(j)),(50*i),"menu")
      window[files[j]+ranks[i] + "i"] = new component(50,50,piecesImages[0],(50*(j)),(50*i),"stillimage")
    }
  }
} else {
  for(i=0; i<8; i++){
    for(j=0;j<8;j++){
      color = "gainsboro"
      if(Number.isInteger((i+j-1)/2)){
        color="white"
      }
      window[otherFiles[j]+(i+1)] = new component(50,50,color,50*j,50*i,"menu")
      window[otherFiles[j]+(i+1) + "i"] = new component(50,50,piecesImages[0],(50*(j)),(50*i),"stillimage")

    }
  }
}
}
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
function isInCheck(white){
  var i;
  var j;
  var king;
  for(i=0;i<8;i++){
    for(j=0;j<8;j++){
      if(board[i][j] == "K" && white){
        king = files[j]+ranks[i];
        break;
      }
      else if(board[i][j] == "k" && !white){
        king = files[j]+ranks[i];
        break;
      }
    }
  }
  var moves = legalChessMoves(!white);
  var l;
  for(l=0;l<moves.length;l++){
    if(moves[l].endsWith(king)){
      return true;
    }
  }
  return false;

}
function legalChessMoves(white){
  var moves = [];
  var i;
  var j;
  var l;
  if(white){
  for(i=0;i<8;i++){
    for(j=0;j<8;j++){
      var stopYet = false;
      if(board[i][j] == "P"){
        try{
        if(ranks[i]==2 && board[i-2][j] == "" && board[i-1][j] == ""){
          moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1+3)
        }
      } catch(err){
        console.log(err)
      }
        if(board[i-1][j] == ""){
          if(i==1){
          moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1+2)+"P";
        } else {
          moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1+2);
        }
        }
        if(piecesBlack.includes(board[i-1][j-1])){
          moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i-1]
        }
        if(piecesBlack.includes(board[i-1][j+1])){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i-1]
        }
        //En Passant
        if(previousMoves[previousMoves.length-1] == files[j+1]+ranks[i-2]+files[j+1]+ranks[i]){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i-1]
        }
        if(previousMoves[previousMoves.length-1] == files[j-1]+ranks[i-2]+files[j-1]+ranks[i]){
          moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i-1]
        }
      }
      else if(board[i][j] == "R"){
        //Down
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(i+l<8){
          if(piecesBlack.includes(board[i+l][j])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-l)
          }
          else if(piecesWhite.includes(board[i+l][j])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-l)
          }
        }
        }
        stopYet = false;
        //Up
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1){
          if(piecesBlack.includes(board[i-l][j])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1+l+1)
          }
          else if(piecesWhite.includes(board[i-l][j])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1+l+1)
          }
        }
        }
        stopYet = false;
        //Left
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(j-l>-1){
          if(piecesBlack.includes(board[i][j-l])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i]
          }
          else if(piecesWhite.includes(board[i][j-l])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i]
          }
        }
        }
        stopYet = false;
        //Right
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(j+l<8){
          if(piecesBlack.includes(board[i][j+l])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i]
          }
          else if(piecesWhite.includes(board[i][j+l])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i]
          }
        }
        }
      }
      else if(board[i][j] == "B"){
        //UR
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1 && j+l<8){
            if(piecesBlack.includes(board[i-l][j+l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i-l]
            }
            else if(piecesWhite.includes(board[i-l][j+l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i-l]
            }
          }
        }
        stopYet = false;
        //UL
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1 && j-l>-1){
            if(piecesBlack.includes(board[i-l][j-l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i-l]
            }
            else if(piecesWhite.includes(board[i-l][j-l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i-l]
            }
          }
        }
        stopYet = false;
        //DL
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i+l<8 && j-l>-1){
            if(piecesBlack.includes(board[i+l][j-l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i+l]
            }
            else if(piecesWhite.includes(board[i+l][j-l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i+l]
            }
          }
        }
        stopYet = false;
        //DR
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i+l<8 && j+l<8){
            if(piecesBlack.includes(board[i+l][j+l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i+l]
            }
            else if(piecesWhite.includes(board[i+l][j+l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i+l]
            }
          }
        }
      }
      else if(board[i][j] == "Q"){
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(i+l<8){
          if(piecesBlack.includes(board[i+l][j])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-l)
          }
          else if(piecesWhite.includes(board[i+l][j])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-l)
          }
        }
        }
        stopYet = false;
        //Up
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1){
          if(piecesBlack.includes(board[i-l][j])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1+l+1)
          }
          else if(piecesWhite.includes(board[i-l][j])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1+l+1)
          }
        }
        }
        stopYet = false;
        //Left
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(j-l>-1){
          if(piecesBlack.includes(board[i][j-l])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i]
          }
          else if(piecesWhite.includes(board[i][j-l])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i]
          }
        }
        }
        stopYet = false;
        //Right
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(j+l<8){
          if(piecesBlack.includes(board[i][j+l])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i]
          }
          else if(piecesWhite.includes(board[i][j+l])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i]
          }
        }
        }
        stopYet= false;
        //UR
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1 && j+l<8){
            if(piecesBlack.includes(board[i-l][j+l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i-l]
            }
            else if(piecesWhite.includes(board[i-l][j+l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i-l]
            }
          }
        }
        stopYet = false;
        //UL
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1 && j-l>-1){
            if(piecesBlack.includes(board[i-l][j-l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i-l]
            }
            else if(piecesWhite.includes(board[i-l][j-l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i-l]
            }
          }
        }
        stopYet = false;
        //DL
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i+l<8 && j-l>-1){
            if(piecesBlack.includes(board[i+l][j-l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i+l]
            }
            else if(piecesWhite.includes(board[i+l][j-l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i+l]
            }
          }
        }
        stopYet = false;
        //DR
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i+l<8 && j+l<8){
            if(piecesBlack.includes(board[i+l][j+l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i+l]
            }
            else if(piecesWhite.includes(board[i+l][j+l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i+l]
            }
          }
        }
      }
      else if(board[i][j] == "N"){
        //UL
        if(i-2>-1 && j-1>-1){
          if(!piecesWhite.includes(board[i-2][j-1])){
          moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i-2];
        }
        }
        if(i-1>-1 && j-2>-1){
          if(!piecesWhite.includes(board[i-1][j-2])){
          moves[moves.length] = files[j]+ranks[i]+files[j-2]+ranks[i-1];
        }
        }
        //UR
        if(i-2>-1 && j+1<8){
          if(!piecesWhite.includes(board[i-2][j+1])){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i-2];
        }
        }
        if(i-1>-1 && j+2<8){
          if(!piecesWhite.includes(board[i-1][j+2])){
          moves[moves.length] = files[j]+ranks[i]+files[j+2]+ranks[i-1];
        }
        }
        //DL
        if(i+2<8 && j-1>-1){
          if(!piecesWhite.includes(board[i+2][j-1])){
          moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i+2];
        }
        }
        if(i+1<8 && j-2>-1){
          if(!piecesWhite.includes(board[i+1][j-2])){
          moves[moves.length] = files[j]+ranks[i]+files[j-2]+ranks[i+1];
        }
        }
        //DR
        if(i+2<8 && j+1<8){
          if(!piecesWhite.includes(board[i+2][j+1])){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i+2];
        }
        }
        if(i+1<8 && j+2<8){
          if(!piecesWhite.includes(board[i+1][j+2])){
          moves[moves.length] = files[j]+ranks[i]+files[j+2]+ranks[i+1];
        }
        }
      }
      else if(board[i][j] == "K"){
        var l;
        var kingMoved = false;
        var rRookMoved = false;
        var lRookMoved = false;
        for(l=0;l<previousMoves.length;l++){
          if(kingMoved || rRookMoved){
            break
          }
          if(previousMoves[l].startsWith("h1") || previousMoves[l].endsWith("h1")){
            rRookMoved = true;
          }
          if(previousMoves[l].startsWith("a1") || previousMoves[l].endsWith("a1")){
            lRookMoved = true;
          }
          if(previousMoves[l].startsWith("e1")){
            kingMoved = true;
          }
        }
        //Up
        if(i-1>-1){
          if(!piecesWhite.includes(board[i-1][j])){
          moves[moves.length] = files[j]+ranks[i]+files[j]+ranks[i-1];
        }
        }
        //Down
        if(i+1<8){
          if(!piecesWhite.includes(board[i+1][j])){
          moves[moves.length] = files[j]+ranks[i]+files[j]+ranks[i+1];
        }
        }
        //Left
        if(j-1>-1){
          if(!piecesWhite.includes(board[i][j-1])){
          moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i];
          //Long Castle
          if(!kingMoved && !lRookMoved && board[i][j-2] == "" && board[i][j-3] == ""){
            moves[moves.length] = files[j]+ranks[i]+files[j-2]+ranks[i]
          }
        }
        }
        //Right
        if(j+1<8){
          if(!piecesWhite.includes(board[i][j+1])){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i];
          //Short Castle
          if(!kingMoved && !rRookMoved && board[i][j+2] == ""){
            moves[moves.length] = files[j]+ranks[i]+files[j+2]+ranks[i]
          }
        }
        }
        //UL
        if(i-1>-1 && j-1>-1){
          if(!piecesWhite.includes(board[i-1][j-1])){
            moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i-1]
          }
        //UR
        if(i-1>-1 && j+1<8){
          if(!piecesWhite.includes(board[i-1][j+1])){
            moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i-1]
          }
        }
        //DL
        if(i+1<8 && j-1>-1){
          if(!piecesWhite.includes(board[i+1][j-1])){
            moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i+1]
          }
      }
      //DR
      if(i+1<8 && j+1<8){
        if(!piecesWhite.includes(board[i+1][j+1])){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i+1]
        }
    }
    }
  }
}
}
}
else {
  for(i=0;i<8;i++){
    for(j=0;j<8;j++){
      var stopYet = false;
      if(board[i][j] == "p"){
        try{
        if(ranks[i]==7 && board[i+2][j] == "" && board[i+1][j] == ""){ //Pawn moves foward 2 first move
          moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-2)
        }
      } catch(err){
        console.log(err)
      }
        if(board[i+1][j] == ""){ //Promotion
          if(i==6){
          moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1)+"P";
        } else {
          moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1);
        }
        }
        if(piecesWhite.includes(board[i+1][j+1])){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i+1]
        }
        if(piecesWhite.includes(board[i+1][j-1])){
          moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i+1]
        }
        //En Passant
        if(previousMoves[previousMoves.length-1] == files[j+1]+ranks[i+2]+files[j+1]+ranks[i]){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i+1]
        }
        if(previousMoves[previousMoves.length-1] == files[j-1]+ranks[i+2]+files[j-1]+ranks[i]){
          moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i+1]
        }
      }
      else if(board[i][j] == "r"){
        //Down
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(i+l<8){
          if(piecesWhite.includes(board[i+l][j])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-l)
          }
          else if(piecesBlack.includes(board[i+l][j])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-l)
          }
        }
        }
        stopYet = false;
        //Up
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1){
          if(piecesWhite.includes(board[i-l][j])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1+l+1)
          }
          else if(piecesBlack.includes(board[i-l][j])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1+l+1)
          }
        }
        }
        stopYet = false;
        //Left
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(j-l>-1){
          if(piecesWhite.includes(board[i][j-l])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i]
          }
          else if(piecesBlack.includes(board[i][j-l])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i]
          }
        }
        }
        stopYet = false;
        //Right
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(j+l<8){
          if(piecesWhite.includes(board[i][j+l])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i]
          }
          else if(piecesBlack.includes(board[i][j+l])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i]
          }
        }
        }
      }
      else if(board[i][j] == "b"){
        //UR
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1 && j+l<8){
            if(piecesWhite.includes(board[i-l][j+l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i-l]
            }
            else if(piecesBlack.includes(board[i-l][j+l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i-l]
            }
          }
        }
        stopYet = false;
        //UL
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1 && j-l>-1){
            if(piecesWhite.includes(board[i-l][j-l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i-l]
            }
            else if(piecesBlack.includes(board[i-l][j-l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i-l]
            }
          }
        }
        stopYet = false;
        //DL
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i+l<8 && j-l>-1){
            if(piecesWhite.includes(board[i+l][j-l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i+l]
            }
            else if(piecesBlack.includes(board[i+l][j-l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i+l]
            }
          }
        }
        stopYet = false;
        //DR
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i+l<8 && j+l<8){
            if(piecesWhite.includes(board[i+l][j+l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i+l]
            }
            else if(piecesBlack.includes(board[i+l][j+l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i+l]
            }
          }
        }
      }
      else if(board[i][j] == "q"){
        //Down
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          if(i+l<8){
          if(piecesWhite.includes(board[i+l][j])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-l)
          }
          else if(piecesBlack.includes(board[i+l][j])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-l)
          }
        }
        }
        stopYet = false;
        //Up
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1){
          if(piecesWhite.includes(board[i-l][j])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1+l+1)
          }
          else if(piecesBlack.includes(board[i-l][j])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j]+(ranks[i]-1+l+1)
          }
        }
        }

        stopYet = false;
        //Left
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(j-l>-1){
          if(piecesWhite.includes(board[i][j-l])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i]
          }
          else if(piecesBlack.includes(board[i][j-l])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i]
          }
        }
        }
        stopYet = false;
        //Right
        for(l=1; l<9; l++){
          if(stopYet){
            continue
          }
          else if(j+l<8){
          if(piecesWhite.includes(board[i][j+l])){
            stopYet = true;
            moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i]
          }
          else if(piecesBlack.includes(board[i][j+l])){
            stopYet = true;
          }
          else {
            moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i]
          }
        }
        }
        stopYet= false;
        //UR
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1 && j+l<8){
            if(piecesWhite.includes(board[i-l][j+l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i-l]
            }
            else if(piecesBlack.includes(board[i-l][j+l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i-l]
            }
          }
        }
        stopYet = false;
        //UL
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i-l>-1 && j-l>-1){
            if(piecesWhite.includes(board[i-l][j-l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i-l]
            }
            else if(piecesBlack.includes(board[i-l][j-l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i-l]
            }
          }
        }
        stopYet = false;
        //DL
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i+l<8 && j-l>-1){
            if(piecesWhite.includes(board[i+l][j-l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i+l]
            }
            else if(piecesBlack.includes(board[i+l][j-l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j-l]+ranks[i+l]
            }
          }
        }
        stopYet = false;
        //DR
        for(l=1;l<9;l++){
          if(stopYet){
            continue
          }
          else if(i+l<8 && j+l<8){
            if(piecesWhite.includes(board[i+l][j+l])){
              stopYet = true;
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i+l]
            }
            else if(piecesBlack.includes(board[i+l][j+l])){
              stopYet = true;
            }
            else {
              moves[moves.length] = files[j]+ranks[i]+files[j+l]+ranks[i+l]
            }
          }
        }
      }
      else if(board[i][j] == "n"){
        //UL
        if(i-2>-1 && j-1>-1){
          if(!piecesBlack.includes(board[i-2][j-1])){
          moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i-2];
        }
        }
        if(i-1>-1 && j-2>-1){
          if(!piecesBlack.includes(board[i-1][j-2])){
          moves[moves.length] = files[j]+ranks[i]+files[j-2]+ranks[i-1];
        }
        }
        //UR
        if(i-2>-1 && j+1<8){
          if(!piecesBlack.includes(board[i-2][j+1])){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i-2];
        }
        }
        if(i-1>-1 && j+2<8){
          if(!piecesBlack.includes(board[i-1][j+2])){
          moves[moves.length] = files[j]+ranks[i]+files[j+2]+ranks[i-1];
        }
        }
        //DL
        if(i+2<8 && j-1>-1){
          if(!piecesBlack.includes(board[i+2][j-1])){
          moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i+2];
        }
        }
        if(i+1<8 && j-2>-1){
          if(!piecesBlack.includes(board[i+1][j-2])){
          moves[moves.length] = files[j]+ranks[i]+files[j-2]+ranks[i+1];
        }
        }
        //DR
        if(i+2<8 && j+1<8){
          if(!piecesBlack.includes(board[i+2][j+1])){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i+2];
        }
        }
        if(i+1<8 && j+2<8){
          if(!piecesBlack.includes(board[i+1][j+2])){
          moves[moves.length] = files[j]+ranks[i]+files[j+2]+ranks[i+1];
        }
        }
      }
      else if(board[i][j] == "k"){
        var l;
        var kingMoved = false;
        var rRookMoved = false;
        var lRookMoved = false;
        for(l=0;l<previousMoves.length;l++){
          if(kingMoved || rRookMoved){
            break
          }
          if(previousMoves[l].startsWith("h8") || previousMoves[l].endsWith("h8")){
            rRookMoved = true;
          }
          if(previousMoves[l].startsWith("a8") || previousMoves[l].endsWith("a8")){
            lRookMoved = true;
          }
          if(previousMoves[l].startsWith("e8")){
            kingMoved = true;
          }
        }
        //Up
        if(i-1>-1){
          if(!piecesBlack.includes(board[i-1][j])){
          moves[moves.length] = files[j]+ranks[i]+files[j]+ranks[i-1];
        }
        }
        //Down
        if(i+1<8){
          if(!piecesBlack.includes(board[i+1][j])){
          moves[moves.length] = files[j]+ranks[i]+files[j]+ranks[i+1];
        }
        }
        //Left
        if(j-1>-1){
          if(!piecesBlack.includes(board[i][j-1])){
          moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i];
          if(!kingMoved && !lRookMoved && board[i][j-2] == "" && board[i][j-3] == ""){
            moves[moves.length] = files[j]+ranks[i]+files[j-2]+ranks[i]
          }
        }
        }
        //Right
        if(j+1<8){
          if(!piecesBlack.includes(board[i][j+1])){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i];
          if(!kingMoved && !rRookMoved && board[i][j+2] == ""){
            moves[moves.length] = files[j]+ranks[i]+files[j+2]+ranks[i]
          }
        }
        }
        //UL
        if(i-1>-1 && j-1>-1){
          if(!piecesBlack.includes(board[i-1][j-1])){
            moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i-1]
          }
        }
        //UR
        if(i-1>-1 && j+1<8){
          if(!piecesBlack.includes(board[i-1][j+1])){
            moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i-1]
          }
        }
        //DL
        if(i+1<8 && j-1>-1){
          if(!piecesBlack.includes(board[i+1][j-1])){
            moves[moves.length] = files[j]+ranks[i]+files[j-1]+ranks[i+1]
          }
      }
      //DR
      if(i+1<8 && j+1<8){
        if(!piecesBlack.includes(board[i+1][j+1])){
          moves[moves.length] = files[j]+ranks[i]+files[j+1]+ranks[i+1]
        }
    }
  }
    }
  }
}
  return moves;
}
function drawPlayer(){
  var i;
  var j;
  var name;
  if(chessBoard){
  for(i=0;i<8;i++){
    for(j=0;j<8;j++){
      name = files[j]+ranks[i]
      window[name].update()
    }
  }
  for(i=0;i<8;i++){
    for(j=0;j<8;j++){
      window[files[j]+ranks[i]+"i"].update()
    }
  }
}
if(promotionMenuWhite){
  promoOutline.update()
  promoBackground.update()
  promoWQ.update()
  promoWB.update()
  promoWN.update()
  promoWR.update()
} else if(promotionMenuBlack){
  promoOutline.update()
  promoBackground.update()
  promoBQ.update()
  promoBB.update()
  promoBN.update()
  promoBR.update()
}
}
function animate() {
  gameCanvasContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  gameCanvasContext.beginPath();
  drawPlayer();
  requestAnimationFrame(animate);
}
function component(width, height, color, x, y, type, text, font) {

  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.ogx = x;
  this.ogy = y;
  this.font = font;
  this.color = color;
  this.showing = true;
  if(type == "square"){
  this.update = function() {
    if(this.showing){
    gameCanvasContext.fillStyle = this.color;
    gameCanvasContext.fillRect(this.ogx - Player.x + 300, this.ogy - Player.y + 200, this.width, this.height);
  }
  }
}
  else if(type == "movingimage"){
    this.update = function(){
      if(this.showing){
    gameCanvasContext.drawImage(this.color, this.ogx - Player.x + 300, this.ogy - Player.y + 200, this.width, this.height);
  }
  }
  }
  else if(type == "stillimage"){
    this.update = function(){
      if(this.showing){
      gameCanvasContext.drawImage(this.color, this.x, this.y, this.height, this.width)
    }
    }
  }
  else if(type == "text"){
    this.text = text;
    gameCanvasContext.textAlign = "center";
    if(!Array.isArray(this.text)){
    this.update = function(){
      if(this.showing){
    gameCanvasContext.fillStyle = this.color;
    gameCanvasContext.font = this.font;
    gameCanvasContext.fillText(this.text, this.x, this.y);
  }
}
} else{
  this.update = function(){
    if(this.showing){
  var fontSize = this.font.split(" ");
  if(fontSize[0].endsWith("px")){
    fontSize = fontSize[0].replaceAll("px", "")
  }
  else{
    fontSize = fontSize[1].replaceAll("px", "")
  }
var i;
  for(i=0; i<this.text.length; i++){
  gameCanvasContext.fillStyle = this.color;
  gameCanvasContext.font = this.font;
  gameCanvasContext.fillText(this.text[i], this.x, this.y+(fontSize*i));
}
}
}
}
  }
  else if(type == "menu"){
    this.update = function(){
      if(this.showing){
      gameCanvasContext.fillStyle = this.color;
      gameCanvasContext.fillRect(this.x, this.y, this.width, this.height);
    }
    }
  }

  this.newPos = function() {
    this.x += this.speedX;
    this.y += this.speedY;
  }
  this.crashWith = function(otherobj) {
    var myleft = this.x;
    var myright = this.x + (this.width);
    var mytop = this.y;
    var mybottom = this.y + (this.height);
    var otherleft = otherobj.ogx;
    var otherright = otherobj.ogx + (otherobj.width);
    var othertop = otherobj.ogy;
    var otherbottom = otherobj.ogy + (otherobj.height);
    var crash = true;
    if ((mybottom < othertop) ||
    (mytop > otherbottom) ||
    (myright < otherleft) ||
    (myleft > otherright)) {
      crash = false;
    }
    return crash;
  }
  this.pointerCrash = function() {
    var myleft = this.ogx;
    var myright = this.ogx + (this.width);
    var mytop = this.ogy;
    var mybottom = this.ogy + (this.height);
    var otherleft = pointer.x;
    var otherright = pointer.x + (pointer.width);
    var othertop = pointer.y;
    var otherbottom = pointer.y + (pointer.height);
    var crash = true;
    if ((mybottom < othertop) ||
    (mytop > otherbottom) ||
    (myright < otherleft) ||
    (myleft > otherright)) {
      crash = false;
    }
    return crash;
  }
  this.hide = function(){
  this.showing = false;
  }
  this.show = function(){
  this.showing = true;
  }
}
function isInteger(num){
  try{
  if(num == Math.floor(num)){
    return true;
  }
} catch(err){

}
}
function connectionCallback(response){
      if (!response.game) return;
      const App = {
        data() {
          return {
            game: response.game,
            me: response.discordUser
          }
        },
        computed: {

        },
        methods: {
        handleClick(event){

            var scrollLeft = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
          var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

            pointer.x = event.clientX - gameCanvas.offsetLeft + scrollLeft;
            pointer.y = event.clientY - gameCanvas.offsetTop + scrollTop;
            if(pointer.x > gameCanvas.width){
            pointer.x = gameCanvas.width;
            }
            if(pointer.y > gameCanvas.height){
            pointer.y = gameCanvas.height;
          }
          createBoard()
          var i;
          var j;
          var l;
          var mySide = true;
          if(side=="black"){
            mySide = false;
          }
          var legalMoves = App.methods.allChessMoves(mySide);
          var myLegalMoves = [];
          if(!promotionMenuBlack && !promotionMenuWhite){
          for(i=0; i<8; i++){
            for(j=0; j<8; j++){
              if(window[files[j]+ranks[i]].pointerCrash()){
                if(selectedSquareMoves.includes(files[j]+ranks[i])){
                  if((board[ranks.indexOf(selectedSquare[1])][files.indexOf(selectedSquare[0])] == "P" && i==0)||(board[ranks.indexOf(selectedSquare[1])][files.indexOf(selectedSquare[0])] == "p" && i==7)){
                    App.methods.movePiece(selectedSquare+files[j]+ranks[i]+"P")
                    selectedPromotionSquare = files[j]+ranks[i]
                  }
                  else {
                  App.methods.movePiece(selectedSquare+files[j]+ranks[i])
                        selectedSquare = "";
                }
                selectedSquareMoves = [];
                }
                else{
                selectedSquare = files[j]+ranks[i];
                for(l=0;l<legalMoves.length;l++){
                  if(legalMoves[l].startsWith(files[j]+ranks[i])){
                    myLegalMoves[myLegalMoves.length] = legalMoves[l][2]+legalMoves[l][3];
                  }
                }
                for(l=0;l<myLegalMoves.length; l++){
                  window[files[j]+ranks[i]].color = "red"
                  window[myLegalMoves[l]].color = "salmon";
                }
                selectedSquareMoves = myLegalMoves;
              }
            }
          }
          }
          }  else if(promotionMenuWhite){
              if(promoWQ.pointerCrash()){
                App.methods.movePiece(selectedSquare+selectedPromotionSquare+"Q")
              } else if(promoWR.pointerCrash()){
                  App.methods.movePiece(selectedSquare+selectedPromotionSquare+"R")
              }
              else if(promoWB.pointerCrash()){
                  App.methods.movePiece(selectedSquare+selectedPromotionSquare+"B")
              }
              else if(promoWN.pointerCrash()){
                  App.methods.movePiece(selectedSquare+selectedPromotionSquare+"N")
              }
              promotionMenuWhite = false;
            } else if(promotionMenuBlack){
              if(promoBQ.pointerCrash()){
                App.methods.movePiece(selectedSquare+selectedPromotionSquare+"Q")
              } else if(promoBR.pointerCrash()){
                  App.methods.movePiece(selectedSquare+selectedPromotionSquare+"R")
              }
              else if(promoBB.pointerCrash()){
                  App.methods.movePiece(selectedSquare+selectedPromotionSquare+"B")
              }
              else if(promoBN.pointerCrash()){
                  App.methods.movePiece(selectedSquare+selectedPromotionSquare+"N")
              }
              promotionMenuBlack = false;
            }
          updateBoard()
        },
        movePiece(move, test, bot){
        if(App.data().game.isItMyTurn() || bot || test){
        var turnColor;
        var i = ranks.indexOf(move[1])
        var j = files.indexOf(move[0])

        if(move.endsWith("P") && !bot){
        if(side=="white"){
          promotionMenuWhite = true;
        } else {
          promotionMenuBlack = true;
        }
        return
        } else if(move.endsWith("Q")){
          if(board[i][j] == "P"){
            board[i][j] = "Q"
          } else {
            board[i][j] = "q"
          }
        } else if(move.endsWith("R")){
          if(board[i][j] == "P"){
            board[i][j] = "R"
          } else {
            board[i][j] = "r"
          }
        } else if(move.endsWith("B")){
          if(board[i][j] == "P"){
            board[i][j] = "B"
          } else {
            board[i][j] = "b"
          }
        } else if(move.endsWith("N")){
          if(board[i][j] == "P"){
            board[i][j] = "N"
          } else {
            board[i][j] = "n"
          }
        }
        if(board[i][j] == "P" || board[i][j] == "p"){
          //En passant!!!!!
        if(move == files[j]+ranks[i]+files[j+1]+ranks[i-1] && previousMoves[previousMoves.length-1] == files[j+1]+ranks[i-2]+files[j+1]+ranks[i]){
          board[i][j+1] = ""
        }
        if(move == files[j]+ranks[i]+files[j-1]+ranks[i-1] && previousMoves[previousMoves.length-1] == files[j-1]+ranks[i-2]+files[j-1]+ranks[i]){
          board[i][j-1] = ""
        }
        if(move == files[j]+ranks[i]+files[j+1]+ranks[i+1] && previousMoves[previousMoves.length-1] == files[j+1]+ranks[i+2]+files[j+1]+ranks[i]){
          board[i][j+1] = ""
        }
        if(move == files[j]+ranks[i]+files[j-1]+ranks[i+1] && previousMoves[previousMoves.length-1] == files[j-1]+ranks[i+2]+files[j-1]+ranks[i]){
          board[i][j-1] = ""
        }
        }
        //Short Castle
        if(board[i][j] == "K" && move == "e1g1"){
          App.methods.movePiece("h1f1")
        }
        if(board[i][j] == "k" && move == "e8g8"){
          App.methods.movePiece("h8f8")
        }
        //Long Castle
        if(board[i][j] == "K" && move == "e1c1"){
          App.methods.movePiece("a1d1")
        }
        if(board[i][j] == "k" && move == "e8c8"){
          App.methods.movePiece("a8d8")
        }

        board[ranks.indexOf(move[3])][files.indexOf(move[2])] = board[ranks.indexOf(move[1])][files.indexOf(move[0])];
        board[ranks.indexOf(move[1])][files.indexOf(move[0])] = "";

        if(!test){
          if(!bot){
            console.log("client emit")
            Client.runAction(App.data().game, "movePiece", {"move":move})
            Client.runAction(App.data().game, "endTurn", {})
          }
        }
        }
        },
        allChessMoves(white){
          var moves = legalChessMoves(white);
          var i;
          for(i=0;i<moves.length;i++){
            var oldBoard = JSON.parse(JSON.stringify(board))
            App.methods.movePiece(moves[i], true, true)
            if(isInCheck(white)){
              moves.splice(i,1);
              i -= 1;
            }
            board = JSON.parse(JSON.stringify(oldBoard))
          }
          if(moves.includes("e1g1") && !moves.includes("e1f1")){
            moves.splice(moves.indexOf("e1g1"),1)
          }
          if(moves.includes("e1c1") && !moves.includes("e1d1")){
          moves.splice(moves.indexOf("e1c1"),1)
          }
          if(moves.includes("e8g8") && !moves.includes("e8f8")){
            moves.splice(moves.indexOf("e8g8"),1)
          }
          if(moves.includes("e1c8") && !moves.includes("e1d8")){
              moves.splice(moves.indexOf("e8c8"),1)
            }
          return moves;
        },
        fixedPromotionForBots(white){
          var moves = App.methods.allChessMoves(white);
          var i;
          for(i=0; i<moves.length; i++){
            if(moves[i].endsWith("P")){
              moves.splice(i,1,moves[i].slice(0,4)+"Q", moves[i].slice(0,4)+"B", moves[i].slice(0,4)+"R", moves[i].slice(0,4)+"N")
            }
          }
          return moves;
        },
        updateOnOpen(){
          board = App.data().game.data.board;
          updateBoard();
        }
        }
      }
      Client.socket.on("turn", (game, turn) => {
        Client.utils.updateGame(App.data().game, game)
        board = game.data.board;
        console.log(game)
        updateBoard()
      })
      if(App.data().game.myIndex == 0){
        side = "black"
        createBoard();
        updateBoard();
      }
      App.methods.updateOnOpen();
        gameCanvas.addEventListener("click", App.methods.handleClick)
}
createBoard()
updateBoard()
animate()
