<template>
  <div class="lose-view dialog-container">
    <div class="lose-view-chip dialog-chip" ref="chip">
      <span>😭 You lose!</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  props: ['game', 'me'],
}
</script>