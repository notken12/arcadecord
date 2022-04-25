// common.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import GameFlow from '../../GameFlow.js';

const SHIP_TYPES = ['Carrier', 'Battleship', 'Cruiser', 'Destroyer'];
const SHIP_LENGTHS = [4, 3, 2, 1];
const SHIP_QUANTITIES = [1, 2, 3, 4];

const BOARD_STATE_EMPTY = 0;
const BOARD_STATE_MISS = 1;
const BOARD_STATE_HIT = 2;
const CELL_SIZE = 40;

const DIR_OFFSETS = [
  {
    row: -1,
    col: 0,
  },
  {
    row: 0,
    col: 1,
  },
  {
    row: 1,
    col: 0,
  },
  {
    row: 0,
    col: -1,
  },
];

class Ship {
  id;
  playerIndex;
  len;
  type;
  dir;
  row;
  col;
  sunk;
  constructor(id, playerIndex, row, col, dir, len, sunk, type) {
    this.id = id;
    this.playerIndex = playerIndex;
    this.row = row;
    this.col = col;
    this.dir = dir;
    this.len = len;
    this.sunk = sunk || false;
    this.type = type;
  }
}

async function shoot(game, action) {
  var playerIndex = action.playerIndex;
  var hitBoard = game.data.hitBoards[playerIndex];
  let { col: c, row: r } = action.data;

  if (hitBoard.cells[r][c].state !== BOARD_STATE_EMPTY) {
    return false; // already shot
  }

  var board =
    game.data.shipBoards[(action.playerIndex + 1) % game.players.length]; // the other player's board
  var hitBoard = game.data.hitBoards[action.playerIndex];

  if (!game.data.placed[action.playerIndex] || !board) {
    return false;
  }

  // get ship at x, y
  var ship = getShipAt(board, c, r);
  if (!ship) {
    hitBoard.cells[r][c].state = BOARD_STATE_MISS;

    // missed, end turn
    await GameFlow.endTurn(game);

    return game;
  }

  // hit, give another chance
  hitBoard.cells[r][c].state = BOARD_STATE_HIT;

  // check if ship is sunk
  let sunk = true;

  let c1 = ship.col;
  let r1 = ship.row;

  let offset = DIR_OFFSETS[ship.dir];

  let c2 = ship.col + (ship.len - 1) * offset.col;
  let r2 = ship.row + (ship.len - 1) * offset.row;

  let rangeC = [c1, c2].sort();
  let rangeR = [r1, r2].sort();

  // Loop through the cells in the 2d bounding box
  for (let c = rangeC[0]; c <= rangeC[1]; c++) {
    for (let r = rangeR[0]; r <= rangeR[1]; r++) {
      // Check if hitboard has hits for all of the cells the ships occupy
      if (hitBoard.cells[r][c].state !== BOARD_STATE_HIT) {
        sunk = false;
        break;
      }
    }
    if (!sunk) break;
  }

  if (sunk) {
    ship.sunk = true;
    board.revealedShips.push(ship);
  }

  // check if all ships are sunk
  var allSunk = true;
  for (var ship of board.ships) {
    if (!ship.sunk) {
      allSunk = false;
      break;
    }
  }
  if (allSunk) {
    await GameFlow.end(game, {
      winner: action.playerIndex,
    });
  }

  return game;
}

class ShipPlacementBoard {
  constructor(width, height) {
    var that = this;

    this.width = width;
    this.height = height;
    this.ships = [];

    this.addShip = function (ship) {
      this.ships.push(ship);
    };

    this.WithShip = function (ship) {
      let newBoard = new ShipPlacementBoard(that.width, that.height);
      newBoard.ships = that.ships.slice();
      newBoard.ships.push(ship);
      return newBoard;
    };

    this.WithoutShip = function (ship) {
      let newBoard = new ShipPlacementBoard(that.width, that.height);
      newBoard.ships = that.ships.filter((s) => s.id != ship.id);
      return newBoard;
    };
  }
}

function isValidPosition(board, ship, c, r, dir, distance) {
  // create a bounding box for the ship that extends 1 tile out
  if (distance === undefined) distance = 0;

  let c1 = c - distance;
  let r1 = r - distance;

  let offset = DIR_OFFSETS[dir];

  let c2 = c + (ship.len - 1) * offset.col + distance;
  let r2 = r + (ship.len - 1) * offset.row + distance;

  let rangeC = [c1, c2].sort();
  let rangeR = [r1, r2].sort();
  c1 = rangeC[0];
  c2 = rangeC[1];
  r1 = rangeR[0];
  r2 = rangeR[1];

  let valid = true;
  // ships cannot be touching each other
  // loop through ships
  for (let j = 0; j < board.ships.length; j++) {
    let shipJ = board.ships[j];

    // get bounding box for the ship
    let c1j = shipJ.col;
    let r1j = shipJ.row;
    let offset = DIR_OFFSETS[shipJ.dir];

    let c2j = shipJ.col + (shipJ.len - 1) * offset.col + distance;
    let r2j = shipJ.row + (shipJ.len - 1) * offset.row + distance;

    let rangeCJ = [c1j, c2j].sort();
    let rangeRJ = [r1j, r2j].sort();
    c1j = rangeCJ[0];
    c2j = rangeCJ[1];
    r1j = rangeRJ[0];
    r2j = rangeRJ[1];

    // check if bounding boxes intersect with AABB
    if (c1 <= c2j && c2 >= c1j && r1 <= r2j && r2 >= r1j) {
      valid = false;
      break;
    }
  }

  return valid;
}

function isBoardValid(b, distance) {
  let shipLengths = []; // Array<ShipLength, ShipQuantity>
  for (let i = 0; i < b.ships.length; i++) {
    shipLengths[b.ships[i].len] = (shipLengths[b.ships[i].len] || 0) + 1;
  }

  for (let i = 0; i < shipLengths.length; i++) {
    let typeIndex = SHIP_LENGTHS.indexOf(i);
    let allowed = SHIP_QUANTITIES[typeIndex];
    if (shipLengths[i] !== allowed) {
      return false;
    }
  }

  var board = new ShipPlacementBoard(b.width, b.height);
  board.ships = b.ships;
  for (let i = 0; i < board.ships.length; i++) {
    let ship = board.ships[i];
    let c1 = ship.col;
    let r1 = ship.row;

    let offset = DIR_OFFSETS[ship.dir];

    let c2 = ship.col + (ship.len - 1) * offset.col;
    let r2 = ship.row + (ship.len - 1) * offset.row;

    let rangeC = [c1, c2].sort();
    let rangeR = [r1, r2].sort();

    // check if ship is inside the board
    if (
      rangeC[0] < 0 ||
      rangeC[0] >= board.width ||
      rangeC[1] < 0 ||
      rangeC[1] >= board.width ||
      rangeR[0] < 0 ||
      rangeR[0] >= board.height ||
      rangeR[1] < 0 ||
      rangeR[1] >= board.height
    )
      return false;

    // check if ship is overlapping
    let excludingShip = board.WithoutShip(ship);

    let valid = isValidPosition(
      excludingShip,
      ship,
      ship.col,
      ship.row,
      ship.dir,
      distance
    );

    if (!valid) return false;
  }
  return true;
}

function GetValidPositions(board, ship, dir) {
  const offset = DIR_OFFSETS[dir];

  let minC = offset.col < 0 ? -(ship.len - 1) * offset.col : 0;
  let maxC =
    offset.col < 0
      ? board.width - 1
      : board.width - 1 - (ship.len - 1) * offset.col;

  let minR = offset.row < 0 ? -(ship.len - 1) * offset.row : 0;
  let maxR =
    offset.row < 0
      ? board.height - 1
      : board.height - 1 - (ship.len - 1) * offset.row;

  // search every tile in the board for a valid position
  // ships cannot be touching each other

  let validPositions = [];

  for (let c = minC; c < maxC + 1; c++) {
    for (let r = minR; r < maxR + 1; r++) {
      if (isValidPosition(board, ship, c, r, dir)) {
        validPositions.push({ col: c, row: r, dir });
      }
    }
  }
  return validPositions;
}

function GetRandomShipPosition(board, ship) {
  let validPositionsHorizontal = GetValidPositions(board, ship, 1);
  let validPositionsVertical = GetValidPositions(board, ship, 0);

  let validPositions = validPositionsHorizontal.concat(validPositionsVertical);
  let position =
    validPositions[Math.floor(Math.random() * validPositions.length)];

  return position;
}

function PlaceShips(shipsRemaining, board) {
  let shipToPlace = shipsRemaining[0];

  // If all ships were placed, we are done.
  if (shipsRemaining.length == 0) {
    return board;
  }

  let attempts = 0;
  while (attempts++ < 100000) {
    // Get a position for the new ship that is OK with the current board.
    let pos = GetRandomShipPosition(board, shipToPlace);

    // If it isn't possible to find such a position, this branch is bad.
    if (pos == null) return null;

    shipToPlace.col = pos.col;
    shipToPlace.row = pos.row;
    shipToPlace.dir = pos.dir;

    // Create a new board, including the new ship.
    let newBoard = board.WithShip(shipToPlace);

    // Recurse by placing remaining ships on the new board.
    let nextBoard = PlaceShips([...shipsRemaining].slice(1), newBoard);
    if (nextBoard != null) return nextBoard;
  }
  return null;
}

function getShipAt(board, col, row) {
  for (var i = 0; i < board.ships.length; i++) {
    var ship = board.ships[i];
    let c1 = ship.col;
    let r1 = ship.row;

    let offset = DIR_OFFSETS[ship.dir];

    let c2 = ship.col + (ship.len - 1) * offset.col;
    let r2 = ship.row + (ship.len - 1) * offset.row;

    let [rangeC, rangeR] = [[c1, c2].sort(), [r1, r2].sort()];

    if (
      col >= rangeC[0] &&
      col <= rangeC[1] &&
      row >= rangeR[0] &&
      row <= rangeR[1]
    )
      return ship;
  }
  return null;
}

async function action_placeShips(game, action) {
  var board = action.data.shipPlacementBoard;
  var playerIndex = action.playerIndex;

  if (game.data.placed[playerIndex]) {
    return false;
  }

  if (isBoardValid(board)) {
    game.data.shipBoards[playerIndex] = board;
    game.data.placed[playerIndex] = true;

    const opponentIndex = playerIndex === 1 ? 0 : 1;
    if (!game.data.placed[opponentIndex]) {
      // Wait for opponent to place if they havent
      await GameFlow.endTurn(game);
    }
    return game;
  }
  return false;
}

function getAvailableShips(playerIndex) {
  var ships = [];
  for (var j = 0; j < SHIP_TYPES.length; j++) {
    for (var k = 0; k < SHIP_QUANTITIES[j]; k++) {
      ships.push(
        new Ship(
          `${j}-${k}`,
          playerIndex,
          undefined,
          undefined,
          undefined,
          SHIP_LENGTHS[j],
          false,
          SHIP_TYPES[j]
        )
      );
    }
  }
  return ships;
}

export default {
  SHIP_TYPES,
  SHIP_LENGTHS,
  SHIP_QUANTITIES,
  BOARD_STATE_EMPTY,
  BOARD_STATE_HIT,
  BOARD_STATE_MISS,
  CELL_SIZE,
  shoot,
  ShipPlacementBoard,
  isBoardValid,
  isValidPosition,
  GetValidPositions,
  GetRandomShipPosition,
  PlaceShips,
  getShipAt,
  action_placeShips,
  Ship,
  getAvailableShips,
};
