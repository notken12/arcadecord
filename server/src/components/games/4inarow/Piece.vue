<template>
  <div class="piece" :class="classes" :style="styles"></div>
</template>

<script>
import gsap from 'gsap'
import { Draggable } from 'gsap/dist/Draggable.js'

export default {
  data(){
    return{
      reversedRows:[5, 4, 3, 2, 1, 0]
    }
  },
  props:{
    piece: {
      type: Object,
      required:true
    }
  },
  computed: {
    classes(){
      if(this.piece.color === 0) return "yellow"
      return ""
    },
    styles(){
      let offsetLeft = 0.1 + (this.piece.column)*13.73 + "%"
      let offsetTop = this.reversedRows[this.piece.row]*13.73 + "%"
      return {
        left:offsetLeft,
        top:offsetTop
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme' as theme;
.piece {
  background-image: url("/dist/assets/4inarow/RedChecker.svg");
  background-size: auto 100%;
  cursor: pointer;
  position: absolute;
  left: 0.1%;
  top: 0%;
  width: 13.6%;
  height: 13.6%;
  box-sizing: border-box;
  z-index: 0;
}
.piece.yellow {
  background-image: url("/dist/assets/4inarow/YellowChecker.svg");
}
.selected {
  background-color: #ffffff88;
}
.incheck {
  background-color: #ff000088;
}
</style>
