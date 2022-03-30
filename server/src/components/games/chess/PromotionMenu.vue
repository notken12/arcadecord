<!--
  PromotionMenu.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script>
import cloneDeep from 'lodash.clonedeep'
import bus from '@app/js/vue-event-bus'

export default {
  props: ['move'],
  data() {
    return {
      promotionPieces: ['q', 'r', 'b', 'n'],
    }
  },
  methods: {
    makeMove(piece) {
      let move = cloneDeep(this.move)
      move.promotion = piece
      this.$runAction('movePiece', { move })
      this.$endAnimation(800)
      bus.emit('deselect piece')
      bus.emit('close-promotion-menu')
    },
    closeMenu() {
      bus.emit('close-promotion-menu')
    },
    promotionPieceStyles(piece) {
      let texturePositions = {
        p: 0,
        r: 1,
        n: 2,
        b: 3,
        q: 4,
        k: 5,
      }

      let backgroundPositionX = (texturePositions[piece] / 5) * 100 + '%'

      return {
        'background-position-x': backgroundPositionX,
      }
    },
  },
  computed: {
    promotionPieceClasses() {
      if (this.game.myIndex === 0) {
        return ['black']
      }
      return []
    },
  },
}
</script>

<template>
  <div
    class="dialog-backdrop"
    :class="promotionPieceClasses"
    @click.self="closeMenu"
  >
    <div class="dialog">
      <div
        class="promotion-piece"
        v-for="piece in promotionPieces"
        @click="makeMove(piece)"
        :style="promotionPieceStyles(piece)"
        :key="piece"
        :class="promotionPieceClasses"
      ></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;

.dialog-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
}

.dialog {
  display: flex;
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: theme.$md-elevation-level3;
  width: 50%;
  min-width: 160px;
  min-height: 40px;
  height: 12.5%;
}

@media screen and (max-width: 500px) {
  .dialog {
    width: 100%;
    min-width: 0;
    height: 25%;
    min-height: 0;
  }
}

h1 {
  font-size: 24px;
  margin: 0;
}

.promotion-piece {
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  background-image: url('/assets/chess/white_pieces.svg');
  background-size: auto 100%;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.7));
  width: 100%;
  height: 100%;
  transition: transform 0.25s ease;
}

.promotion-piece.black {
  background-image: url('/assets/chess/black_pieces.svg');
}

.promotion-piece:hover {
  transform: scale(1.1);
}

.dialog-backdrop.black {
  transform: rotate(180deg);
}
</style>
