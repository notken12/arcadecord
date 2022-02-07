<script>
import cloneDeep from 'lodash.clonedeep'
import bus from '@app/js/vue-event-bus'

export default {
  props: ['move'],
  data() {
    return {
      promotionPieces: ['q', 'r', 'b', 'n'],
      pieces: {
        q: '♛',
        r: '♜',
        b: '♝',
        n: '♞',
      },
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
  },
  computed: {
    styles() {
      if (this.game.myIndex === -1 || this.game.myIndex === 1) {
        return {
          transform: 'rotate(180deg)',
        }
      }
    },
  },
}
</script>

<template>
  <div class="dialog-backdrop" :style="styles" @click.self="closeMenu">
    <div class="dialog">
      <div
        class="promotion-piece"
        v-for="piece in promotionPieces"
        @click="makeMove(piece)"
        :key="piece"
      >
        {{ pieces[piece] }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;

.dialog-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog {
  display: flex;
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: theme.$md-elevation-level3;
}

h1 {
  font-size: 24px;
  margin: 0;
}

.promotion-piece {
  display: flex;
  width: 1em;
  height: 1em;
  text-align: center;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.25s;
  border-radius: 4px;
}

.promotion-piece:hover {
  background: #eee;
}
</style>