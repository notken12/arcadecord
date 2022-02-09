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
    return {}
  },
  props: [],
}
</script>