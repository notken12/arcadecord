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
        FEUER!
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

import store from '@app/js/store'

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
      myHitBoard: null,
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
      console.log(this.shipPlacementBoard)
      console.log(
        'Placing ships took ' + Math.round(t2 - t1) + ' milliseconds.'
      )
    },
    setShips() {
      runAction(
        this.game,
        'set_ships',
        { shipPlacementBoard: this.shipPlacementBoard },
        (response) => {
          console.log(response)
          if (response.success) {
            clientUtils.updateGame(this.game, response.game)
            this.game.turn = response.game.turn
          }
        }
      )
    },
    shoot() {
      var cell = this.targetedCell

      var y = cell.y
      var x = cell.x
      if (cell) {
        runAction(
          this.game,
          'shoot',
          { y, x },
          (response) => {
            console.log(response)
            if (response.success) {
              // play shooting animation
              var responseCell =
                response.game.data.hitBoards[response.game.myIndex].cells[y][x]

              this.targetedCell = null

              if (responseCell.state === Common.BOARD_STATE_MISS) {
                this.game.client.emit('set_animation', { y, x }, 'miss 1s')

                setTimeout(() => {
                  console.log('updating game from cell miss')
                  store.commit('UPDATE_GAME', response.game)
                }, 1000)
              } else if (responseCell.state === Common.BOARD_STATE_HIT) {
                this.game.client.emit('set_animation', { y, x }, 'hit 0.5s')

                setTimeout(() => {
                  console.log('updating game from cell hit')
                  store.commit('UPDATE_GAME', response.game)
                }, 500)
              }
            }
          },
          true
        )
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
  },
  created() {
    this.myHitBoard = getMyHitBoard(this.game)
    this.availableShips =
      this.game.data.availableShips[this.myHitBoard.playerIndex]

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
  mounted() {
    this.$replayTurn(() => {
      this.$endReplay()
    })
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