<script setup>
import Switch from './Switch.vue'

import bus from '@app/js/vue-event-bus.js'

const closeManual = () => {
  bus.emit('close-settings')
}
</script>

<template>
  <div class="modal-bg">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-header-close">
          <button class="btn-icon" @click="closeManual">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="modal-header-text">
          <span>Settings</span>
        </div>
      </div>
      <div class="modal-content">
        <h2>Graphics</h2>
        <ul class="settings-items">
          <li>Enable confetti<Switch></Switch></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="scss/base/_modal.scss"></style>
