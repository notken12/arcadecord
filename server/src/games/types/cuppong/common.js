// common.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// common.js is used to define values and functions that are used by both the client and the server
// Write the main game logic here
// Common action models

// Import GameFlow to control game flow
import GameFlow from '../../GameFlow.js'

// Class to represent a cup
class Cup {
  id // unique id
  color
  rowNum // The row of the cup. The end of the table is row 0.
  rowPos // The position of the cup in the row, ascending from left to right (relative to the end of the table). The middle of the row is 0. For the rows with an even amount of cups, the left cup -0.5, the right cup 0.5.
  out = false // true if the cup is out
  constructor(id, color, rowNum, rowPos, out) {
    this.id = id
    this.color = color
    this.rowNum = rowNum
    this.rowPos = rowPos
    this.out = out || false
  }
}

// This is an action model for the game.
// They follow the pattern of taking the parameters (game, action) and returning a new game state
// or false if the action is invalid

// See Action.js for documentation (hint: hit ctrl+p)
async function action_throw(game, action) {
  // Action data: a Vector3 force of the throw
  // and the id of the cup that was knocked down

  // The player gets two throws
  // If the player does not make both throws, the turn ends
  // Otherwise, the player gets their balls back and get two more throws
  // And on until the player doesn't make both throws

  // When the player finishes knocking over all the opponent's cups, their turn ends
  // On the next turn, the opponent gets a redemption turn and if they knock over a cup, their last cup comes back into play and the game continues
  // If they fail the redemption, they lose the game

  let hitCupID = action.data.knockedCup
  let opponentSide = game.data.sides[[1, 0][game.turn]]
  let opponentsCups = opponentSide.cups
  let thisSide = game.data.sides[game.turn]

  thisSide.ballsBack = false

  thisSide.throwCount += 1
  if (!hitCupID) {
    if (thisSide.inRedemption && thisSide.throwCount === 2) {
      //Failed Redemption
      // End the game and set the winner to the opponent
      await GameFlow.end(game, {
        winner: [1, 0][game.turn],
      })
    }
  } else {
    thisSide.throwsMade += 1
    let hitCup = opponentsCups.find((c) => c.id === hitCupID)
    if (!hitCup) {
      return false
    }
    hitCup.out = true
    opponentSide.lastKnocked = hitCupID
    if (thisSide.inRedemption) {
      thisSide.cups.find((f) => f.id === thisSide.lastKnocked).out = false
      thisSide.inRedemption = false
    }

    rearrangeCups(game)

    // If you knock over all of the cups, the opponent gets a redemption turn
    if (getCupsLeft(opponentsCups).length === 0) {
      opponentSide.inRedemption = true

      // Reset throws
      thisSide.throwCount = 0
      thisSide.throwsMade = 0

      // End turn
      await GameFlow.endTurn(game)
      return game
    }
  }

  // If this is your second shot...
  if (thisSide.throwCount === 2) {
    if (thisSide.throwsMade !== 2) {
      // If you don't make both shots, your turn ends
      await GameFlow.endTurn(game)
    } else {
      // Player hit both shots, balls back
      thisSide.ballsBack = true
    }
    // Reset throws
    thisSide.throwCount = 0
    thisSide.throwsMade = 0
  }

  return game
}
function getCupsLeft(cups) {
  let cupsLeft = []
  for (let i = 0; i < cups.length; i++) {
    if (!cups[i].out) {
      cupsLeft.push(cups[i])
    }
  }
  return cupsLeft
}

function rearrangeCups(game) {
  game.data.sides.forEach((side) => {
    let remainingCups = getCupsLeft(side.cups)

    // Do not rearrange if its just 1 cup left
    if (remainingCups.length === 1) {
      return
    }

    let totalCups = 0
    let canBeRearranged = false
    let rows
    for (rows = 1; totalCups <= remainingCups.length; rows++) {
      totalCups += rows
      if (totalCups === remainingCups.length) {
        canBeRearranged = true
        break
      }
    }

    if (!canBeRearranged) {
      return
    }

    let positions = getTriangleArrangement(rows, 4)
    for (let i = 0; i < remainingCups.length; i++) {
      let cup = remainingCups[i]
      let pos = positions[i]
      cup.rowNum = pos.rowNum
      cup.rowPos = pos.rowPos
    }
  })
}

function getTriangleArrangement(rows, maxRows) {
  let positions = []
  let diff = maxRows - rows
  for (let rowNum = diff; rowNum < maxRows; rowNum++) {
    // Row 0 is the back row
    let cupCount = maxRows - rowNum
    // rowPos 0 is the center of the row

    let offset = 0.5
    for (
      let rowPos = -cupCount / 2 + offset;
      rowPos <= cupCount / 2 - offset;
      rowPos++
    ) {
      let pos = {
        rowNum: rowNum,
        rowPos: rowPos,
      }
      positions.push(pos)
    }
  }
  return positions
}

// Export all the action models and useful variables
export default {
  Cup,
  action_throw,
  getCupsLeft,
  rearrangeCups,
  getTriangleArrangement,
}
