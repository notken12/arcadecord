<template>
  <div class="piece" :style="styles" :class="classes"></div>
</template>
<script>
  import Common from '/gamecommons/4inarow'
  export default {
    computed:{
      styles(){
        return undefined;
      },
      classes(){
        return ""
      }
    }
  }
</script>
<style>
.piece{
  background-color:red;
}
</style>
