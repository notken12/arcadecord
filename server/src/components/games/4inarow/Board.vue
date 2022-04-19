<!--
  Board.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="board-wrapper">
    <div class="board" ref="el">
      <svg
        width="700"
        height="600"
        viewBox="0 0 700 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0 0H700V600H0V0ZM94 50C94 74.3005 74.3005 94 50 94C25.6995 94 6 74.3005 6 50C6 25.6995 25.6995 6 50 6C74.3005 6 94 25.6995 94 50ZM150 94C174.301 94 194 74.3005 194 50C194 25.6995 174.301 6 150 6C125.699 6 106 25.6995 106 50C106 74.3005 125.699 94 150 94ZM294 50C294 74.3005 274.301 94 250 94C225.699 94 206 74.3005 206 50C206 25.6995 225.699 6 250 6C274.301 6 294 25.6995 294 50ZM350 94C374.301 94 394 74.3005 394 50C394 25.6995 374.301 6 350 6C325.699 6 306 25.6995 306 50C306 74.3005 325.699 94 350 94ZM494 50C494 74.3005 474.301 94 450 94C425.699 94 406 74.3005 406 50C406 25.6995 425.699 6 450 6C474.301 6 494 25.6995 494 50ZM550 94C574.301 94 594 74.3005 594 50C594 25.6995 574.301 6 550 6C525.699 6 506 25.6995 506 50C506 74.3005 525.699 94 550 94ZM694 50C694 74.3005 674.301 94 650 94C625.699 94 606 74.3005 606 50C606 25.6995 625.699 6 650 6C674.301 6 694 25.6995 694 50ZM50 194C74.3005 194 94 174.301 94 150C94 125.699 74.3005 106 50 106C25.6995 106 6 125.699 6 150C6 174.301 25.6995 194 50 194ZM194 150C194 174.301 174.301 194 150 194C125.699 194 106 174.301 106 150C106 125.699 125.699 106 150 106C174.301 106 194 125.699 194 150ZM250 194C274.301 194 294 174.301 294 150C294 125.699 274.301 106 250 106C225.699 106 206 125.699 206 150C206 174.301 225.699 194 250 194ZM394 150C394 174.301 374.301 194 350 194C325.699 194 306 174.301 306 150C306 125.699 325.699 106 350 106C374.301 106 394 125.699 394 150ZM450 194C474.301 194 494 174.301 494 150C494 125.699 474.301 106 450 106C425.699 106 406 125.699 406 150C406 174.301 425.699 194 450 194ZM594 150C594 174.301 574.301 194 550 194C525.699 194 506 174.301 506 150C506 125.699 525.699 106 550 106C574.301 106 594 125.699 594 150ZM650 194C674.301 194 694 174.301 694 150C694 125.699 674.301 106 650 106C625.699 106 606 125.699 606 150C606 174.301 625.699 194 650 194ZM94 250C94 274.301 74.3005 294 50 294C25.6995 294 6 274.301 6 250C6 225.699 25.6995 206 50 206C74.3005 206 94 225.699 94 250ZM150 294C174.301 294 194 274.301 194 250C194 225.699 174.301 206 150 206C125.699 206 106 225.699 106 250C106 274.301 125.699 294 150 294ZM294 250C294 274.301 274.301 294 250 294C225.699 294 206 274.301 206 250C206 225.699 225.699 206 250 206C274.301 206 294 225.699 294 250ZM350 294C374.301 294 394 274.301 394 250C394 225.699 374.301 206 350 206C325.699 206 306 225.699 306 250C306 274.301 325.699 294 350 294ZM494 250C494 274.301 474.301 294 450 294C425.699 294 406 274.301 406 250C406 225.699 425.699 206 450 206C474.301 206 494 225.699 494 250ZM550 294C574.301 294 594 274.301 594 250C594 225.699 574.301 206 550 206C525.699 206 506 225.699 506 250C506 274.301 525.699 294 550 294ZM694 250C694 274.301 674.301 294 650 294C625.699 294 606 274.301 606 250C606 225.699 625.699 206 650 206C674.301 206 694 225.699 694 250ZM50 394C74.3005 394 94 374.301 94 350C94 325.699 74.3005 306 50 306C25.6995 306 6 325.699 6 350C6 374.301 25.6995 394 50 394ZM194 350C194 374.301 174.301 394 150 394C125.699 394 106 374.301 106 350C106 325.699 125.699 306 150 306C174.301 306 194 325.699 194 350ZM250 394C274.301 394 294 374.301 294 350C294 325.699 274.301 306 250 306C225.699 306 206 325.699 206 350C206 374.301 225.699 394 250 394ZM394 350C394 374.301 374.301 394 350 394C325.699 394 306 374.301 306 350C306 325.699 325.699 306 350 306C374.301 306 394 325.699 394 350ZM450 394C474.301 394 494 374.301 494 350C494 325.699 474.301 306 450 306C425.699 306 406 325.699 406 350C406 374.301 425.699 394 450 394ZM594 350C594 374.301 574.301 394 550 394C525.699 394 506 374.301 506 350C506 325.699 525.699 306 550 306C574.301 306 594 325.699 594 350ZM650 394C674.301 394 694 374.301 694 350C694 325.699 674.301 306 650 306C625.699 306 606 325.699 606 350C606 374.301 625.699 394 650 394ZM94 450C94 474.301 74.3005 494 50 494C25.6995 494 6 474.301 6 450C6 425.699 25.6995 406 50 406C74.3005 406 94 425.699 94 450ZM150 494C174.301 494 194 474.301 194 450C194 425.699 174.301 406 150 406C125.699 406 106 425.699 106 450C106 474.301 125.699 494 150 494ZM294 450C294 474.301 274.301 494 250 494C225.699 494 206 474.301 206 450C206 425.699 225.699 406 250 406C274.301 406 294 425.699 294 450ZM350 494C374.301 494 394 474.301 394 450C394 425.699 374.301 406 350 406C325.699 406 306 425.699 306 450C306 474.301 325.699 494 350 494ZM494 450C494 474.301 474.301 494 450 494C425.699 494 406 474.301 406 450C406 425.699 425.699 406 450 406C474.301 406 494 425.699 494 450ZM550 494C574.301 494 594 474.301 594 450C594 425.699 574.301 406 550 406C525.699 406 506 425.699 506 450C506 474.301 525.699 494 550 494ZM694 450C694 474.301 674.301 494 650 494C625.699 494 606 474.301 606 450C606 425.699 625.699 406 650 406C674.301 406 694 425.699 694 450ZM50 594C74.3005 594 94 574.301 94 550C94 525.699 74.3005 506 50 506C25.6995 506 6 525.699 6 550C6 574.301 25.6995 594 50 594ZM194 550C194 574.301 174.301 594 150 594C125.699 594 106 574.301 106 550C106 525.699 125.699 506 150 506C174.301 506 194 525.699 194 550ZM250 594C274.301 594 294 574.301 294 550C294 525.699 274.301 506 250 506C225.699 506 206 525.699 206 550C206 574.301 225.699 594 250 594ZM394 550C394 574.301 374.301 594 350 594C325.699 594 306 574.301 306 550C306 525.699 325.699 506 350 506C374.301 506 394 525.699 394 550ZM450 594C474.301 594 494 574.301 494 550C494 525.699 474.301 506 450 506C425.699 506 406 525.699 406 550C406 574.301 425.699 594 450 594ZM594 550C594 574.301 574.301 594 550 594C525.699 594 506 574.301 506 550C506 525.699 525.699 506 550 506C574.301 506 594 525.699 594 550ZM650 594C674.301 594 694 574.301 694 550C694 525.699 674.301 506 650 506C625.699 506 606 525.699 606 550C606 574.301 625.699 594 650 594Z"
          fill="#0016D8"
        />
      </svg>
      <div class="board-front">
        <ColumnOverlay
          v-for="col in board.width"
          :selectedColumn="selectedColumn"
          :column="col - 1"
          :key="col"
        ></ColumnOverlay>
      </div>
      <div class="board-back">
        <TransitionGroup
          name="piecedrop"
          @enter="animatePiece"
          @appear="updatePiecePos"
        >
          <Piece
            v-for="piece in board.pieces"
            :piece="piece"
            :data-row="piece.row"
            :data-column="piece.column"
            :key="`${piece.row},${piece.column}`"
          ></Piece>
        </TransitionGroup>
        <Transition name="fade">
          <OverPiece
            v-if="selectedColumn !== null"
            :selectedColumn="selectedColumn"
          ></OverPiece
        ></Transition>
      </div>
    </div>
  </div>
  <div>
    <DropButton :selectedColumn="selectedColumn"></DropButton>
  </div>
</template>

<script setup>
import { useAspectRatio } from '@app/components/base-ui/aspectRatio';
import { ref } from 'vue';

const el = ref(null);
useAspectRatio(7 / 7.5, el);
</script>

<script>
import gsap from 'gsap';

import Piece from './Piece.vue';
import DropButton from './DropButton.vue';
import ColumnOverlay from './ColumnOverlay.vue';
import OverPiece from './OverPiece.vue';

import GameFlow from '@app/js/GameFlow';
import Common from '/gamecommons/chess';
import bus from '@app/js/vue-event-bus';
export default {
  data() {
    return {
      selectedColumn: null,
    };
  },
  computed: {
    board() {
      return this.game.data.board;
    },
    buttonShowing() {
      if (this.selectedColumn || this.selectedColumn === 0) return true;
    },
  },
  mounted() {
    bus.on('changeColumn', (column) => {
      this.selectedColumn = column;
    });
  },
  components: {
    Piece,
    DropButton,
    ColumnOverlay,
    OverPiece,
  },
  methods: {
    animatePiece(el, done) {
      let offsetLeft = el.dataset.column * 100 + '%';
      let offsetTop = (5 - el.dataset.row) * 100 + '%';

      gsap.fromTo(
        el,
        {
          y: '-150%',
          x: offsetLeft,
        },
        {
          y: offsetTop,
          x: offsetLeft,
          duration: 0.07 * (5 - el.dataset.row),
          onComplete: done,
          ease: 'power1.in',
        }
      );
    },
    updatePiecePos(el) {
      let offsetLeft = el.dataset.column * 100 + '%';
      let offsetTop = (5 - el.dataset.row) * 100 + '%';

      gsap.to(el, {
        y: offsetTop,
        x: offsetLeft,
        duration: 0,
        // onComplete: done
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;
.board-wrapper {
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
}

.board {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
}

.overUI {
  margin: auto;
}
.board-back {
  background-image: url(/assets/4inarow/FullBack.svg);
  background-size: contain;
  background-repeat: repeat;
  -webkit-filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
  filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.5));
  width: 100%;
  height: 80%;
  position: absolute;
  bottom: 0;
}
.board-front,
svg {
  cursor: pointer;
  box-shadow: theme.$md-elevation-level5;
  box-sizing: border-box;
  width: 100%;
  height: 80%;
  z-index: 1;
  display: flex;
  position: absolute;
  bottom: 0;
}

.piecedrop-enter-active {
  animation: fadeIn 0.1s linear;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
