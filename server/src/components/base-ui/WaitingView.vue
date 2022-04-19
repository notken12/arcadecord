<!--
  WaitingView.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <transition name="fade" appear>
    <div class="waiting-view dialog-container">
      <div class="waiting-view-chip dialog-chip">
        <span>Waiting for opponent</span>
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
    return {};
  },
  props: [],
};
</script>
