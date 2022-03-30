<!--
  SendingView.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <transition name="fade" appear>
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
  mounted() {},
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
