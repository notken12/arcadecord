<!--  App.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.-->

<template>
  <game-view :game="game" :me="me" :hint="hint">
    <div class="middle">
      <ship-placer
        :board="shipPlacementBoard"
        :game="game"
        v-if="!game.data.placed[myHitBoard.playerIndex] && shipPlacementBoard"
      ></ship-placer>
      <hit-board-view
        :board="myHitBoard"
        :target="targetedCell"
        :game="game"
        v-else
      ></hit-board-view>
    </div>

    <div class="bottom">
      <button
        @click="placeShips"
        v-if="!game.data.placed[game.myIndex] && isItMyTurn"
      >
        Shuffle
      </button>
      <button
        @click="setShips"
        v-if="!game.data.placed[game.myIndex] && isItMyTurn"
      >
        Done
      </button>
      <button
        @click="shoot"
        v-if="game.data.placed[game.myIndex] && targetedCell"
      >
        Fire!
      </button>
    </div>

    <div id="game-canvas"></div>
  </game-view>
</template>

<script>
import '@app/scss/games/seabattle.scss'

import Common from '/gamecommons/seabattle'
import ShipPlacer from './ShipPlacer.vue'
import HitBoardView from './HitBoardView.vue'
import cloneDeep from 'lodash.clonedeep'
import { runAction, utils as clientUtils } from '@app/js/client-framework.js'
import GameFlow from '@app/js/GameFlow.js'

function getMyHitBoard(game) {
  var index = game.myIndex
  if (index == -1) {
    if (GameFlow.isItUsersTurn(game, index)) {
      // game hasn't started yet but i can start the game by placing ships
      index = game.turn //dog
    }
  }

  var myHitBoard = game.data.hitBoards[index]

  return myHitBoard
}

export default {
  data() {
    return {
      shipPlacementBoard: null,
      targetedCell: null,
      availableShips: null,
    }
  },
  methods: {
    placeShips() {
      console.log('placing ships')
      var t1 = performance.now()
      this.shipPlacementBoard = Common.PlaceShips(
        cloneDeep(this.availableShips),
        new Common.ShipPlacementBoard(
          this.myHitBoard.width,
          this.myHitBoard.height
        )
      )
      var t2 = performance.now()
      console.log(
        'Placing ships took ' + Math.round(t2 - t1) + ' milliseconds.'
      )
    },
    setShips() {
      this.$runAction('placeShips', {
        shipPlacementBoard: this.shipPlacementBoard,
      })
      this.$endAnimation(500)
    },
    shoot() {
      var cell = this.targetedCell

      if (cell) {
        let { row, col } = cell
        this.$runAction('shoot', { row, col })
        this.targetedCell = null
        this.$endAnimation(1500)
      }
    },
  },
  computed: {
    hint() {
      if (!this.game.data.placed[this.game.myIndex]) {
        return 'Drag ships around or tap to rotate them'
      } else {
        return 'Tap on a tile'
      }
    },
    isItMyTurn() {
      return GameFlow.isItMyTurn(this.game)
    },
    myHitBoard() {
      var index = this.game.myIndex
      if (index == -1) {
        if (GameFlow.isItUsersTurn(this.game, index)) {
          // game hasn't started yet but i can start the game by placing ships
          index = this.game.turn
        }
      }

      var myHitBoard = this.game.data.hitBoards[index]
      return myHitBoard
    },
  },
  mounted() {
    window.Common = Common

    this.$replayTurn(() => {
      this.$endReplay()
    })
    this.availableShips = Common.getAvailableShips(this.myHitBoard.playerIndex)
    console.log('mounted')

    if (
      !this.game.data.placed[this.myHitBoard.playerIndex] &&
      this.isItMyTurn
    ) {
      this.placeShips()
    }
  },
  components: {
    ShipPlacer,
    HitBoardView,
  },
  watch: {
    replaying() {
      if (
        !this.game.data.placed[this.myHitBoard.playerIndex] &&
        this.isItMyTurn
      ) {
        this.placeShips()
      }
    },
  },
}
</script>
