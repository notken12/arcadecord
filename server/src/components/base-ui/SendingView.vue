<template>
  <transition name="fade" appear mode="out-in">
    <div class="sending-view">
      <div class="sending-view-chip" ref="chip">
        <span>Sending</span>
        <span class="dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {}
  },
  mounted() {
  },
}
</script>

<style lang="scss">
@use '../../scss/all-games.scss';

.sending-view {
  @extend .dialog-container;
}

.sending-view-chip {
  @extend .dialog-chip;
}
</style>