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
      <div class="square-ad">
        <!-- Square -->
        <ins
          class="adsbygoogle"
          style="display: block"
          data-ad-client="ca-pub-9949308515923091"
          data-ad-slot="1704737756"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useAdsense } from './adsense.js';

useAdsense();
</script>

<style scoped lang="scss">
.square-ad {
  width: 100%;
}
</style>
