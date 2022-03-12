<template>
  <div class="over" :class="classes" v-on:click="changeColumnSelect"></div>
</template>
<script>
  import bus from '@app/js/vue-event-bus'
  export default{
    props:{
      selectedColumn:{
        type:Number,
        default:null
      },
      column:{
        type:Number,
        required:true
      }
    },
      computed:{
        styles(){
          let offsetLeft = (this.column)*13.75 + "%"
          return {
            left:offsetLeft
          }
        },
        classes(){
          let classArr = []
          if(this.column === this.selectedColumn) classArr.push("selected")
          if(this.game.data.colors[Math.abs(this.game.myIndex)] === 1) classArr.push("yellow")

          return classArr.join(" ")
        },
      },
      methods:{
        changeColumnSelect(){
        if(this.column === this.selectedColumn){
          this.$runAction('place', {col:this.column})
        }else{
        bus.emit("changeColumn", this.column)
      }
      }
    }
  }
</script>
<style lang="scss">
  @use 'scss/base/_theme' as theme;
  .over{
    background-size: auto 100%;
    cursor: pointer;
    /* position: absolute; */
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    z-index: 3;
  }
  .over.selected{
    border: 8px red solid;
  }
  .over.selected.yellow{
    border: 8px yellow solid;
  }
</style>
