<template>
  <div class="piece" :style="styles" :class="classes" ref="pieceEl"></div>
</template>

<script>
import gsap from 'gsap'
import { Draggable } from 'gsap/dist/Draggable.js'
import bus from '@app/js/vue-event-bus'

Draggable.zIndex = 1001
gsap.registerPlugin(Draggable)

export default {
  props: {
    piece: {
      type: Object,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    moves: {
      type: Array,
      default: () => [],
    },
    incheck: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      pieceIcons: {
        p: '♟︎',
        r: '♜',
        n: '♞',
        b: '♝',
        q: '♛',
        k: '♚',
      },
    }
  },
  computed: {
    myColor() {
      let index = this.game.myIndex === -1 ? 1 : this.game.myIndex
      return this.game.data.colors[index]
    },
    styles() {
      let cursor = this.piece.color === this.myColor ? 'grab' : 'default'

      let texturePositions = {
        p: 0,
        r: 1,
        n: 2,
        b: 3,
        q: 4,
        k: 5,
      }

      let backgroundPositionX =
        (texturePositions[this.piece.type] / 5) * 100 + '%'

      return {
        cursor,
        'background-position-x': backgroundPositionX,
      }
    },
    classes() {
      let classes = []
      if (this.piece.color === 1) {
        classes.push('black')
      }
      if (this.incheck) {
        classes.push('incheck')
      }
      return classes
    },
  },
  methods: {
    animate() {
      let top = ((7 - this.piece.rank) / 1) * 100
      let left = (this.piece.file / 1) * 100

      gsap.to(this.$refs.pieceEl, {
        x: left + '%',
        y: top + '%',
        ease: 'power3.inOut',
        duration: 0.25,
        rotation: this.myColor === 1 ? 180 : 0,
      })
    },
  },
  watch: {
    piece: {
      handler(newValue, oldValue) {
        this.animate()
      },
      deep: true,
    },
  },
  mounted() {
    let vm = this

    let top = ((7 - this.piece.rank) / 1) * 100
    let left = (this.piece.file / 1) * 100

    gsap.set(this.$refs.pieceEl, {
      x: left + '%',
      y: top + '%',
      ease: 'power3.inOut',
      rotation: this.myColor === 1 ? 180 : 0,
    })

    if (this.piece.color === this.myColor) {
      Draggable.create(this.$refs.pieceEl, {
        type: 'x,y',
        // bounds: this.$parent.$refs.grid,
        snap: {
          points: (point) => {
            let grid = this.$parent.$refs.grid
            let increment = grid.offsetWidth / 8
            return {
              x: Math.round(point.x / increment) * increment,
              y: Math.round(point.y / increment) * increment,
            }
          },
        },
        snap: 'AFTER',
        onRelease: function (e) {
          let grid = vm.$parent.$refs.grid
          let increment = grid.offsetWidth / 8
          let point = { x: this.endX, y: this.endY }

          let file = Math.round(point.x / increment)
          let rank = 7 - Math.round(point.y / increment)

          if (file === vm.piece.file && rank === vm.piece.rank) {
            vm.animate()
            vm.$refs.pieceEl.style.zIndex = 'initial'
            return
          }

          let moves = vm.moves
          let move = moves.find(
            (m) =>
              m.to[0] === file &&
              m.to[1] === rank &&
              m.from[0] === vm.piece.file &&
              m.from[1] === vm.piece.rank
          )
          if (!move) {
            vm.animate()
            vm.$refs.pieceEl.style.zIndex = 'initial'
            return
          }

          bus.emit('make-move', move)

          vm.$refs.pieceEl.style.zIndex = 'initial'
        },
        onPress: function (e) {
          bus.emit('piece-pointer-down', vm.piece)
        },
        zIndexBoost: true,
      })
    }
  },
}
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;

.piece {
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.7));
  background-image: url('/dist/assets/chess/white_pieces.svg');
  background-size: auto 100%;
  cursor: pointer;
  overflow: hidden;
  position: absolute;
  left: 0;
  top: 0;
  touch-action: none;
  width: 12.5%;
  height: 12.5%;
  box-sizing: border-box;
}

.black {
  background-image: url('/dist/assets/chess/black_pieces.svg');
}

.selected {
  background-color: #ffffff88;
}

.incheck {
  background-color: #ff000088;
}
</style>