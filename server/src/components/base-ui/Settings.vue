<!--
  Settings.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import Switch from './Switch.vue';
import Link from '../index/Link.vue';

import bus from '@app/js/vue-event-bus.js';
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import { updateSettings, resendInvite } from '@app/js/client-framework';

const closeManual = () => {
  bus.emit('close-settings');
};

const store = useStore();

const settings = store?.state?.user?.settings;

const enableConfetti = ref(settings?.enableConfetti ?? true);

function debounce(callback, wait) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
}

watch(
  [enableConfetti],
  debounce(() => {
    if (!window) return;
    console.log('updating settings...');
    updateSettings({
      enableConfetti: enableConfetti.value,
    }).then(() => {
      store.commit('UPDATE_SETTINGS', {
        enableConfetti: enableConfetti.value,
      });
    });
  }, 300)
);

const resending = ref(false);
function resend() {
  console.log('resending invite...');
  resending.value = true;
  resendInvite().then(() => {
    resending.value = false;
  });
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
        <section class="settings-section">
          <template v-if="store">
            <button @click="resend" :disabled="resending">Resend invite</button>
            <h2>Graphics</h2>
            <ul class="settings-items">
              <li><Switch v-model="enableConfetti">Enable confetti</Switch></li>
            </ul>
          </template>
          <h2>Account</h2>
          <ul class="settings-items">
            <li>
              <a href="/sign-out">Sign out</a>
            </li>
          </ul>
        </section>
        <section class="links-section">
          <Link href="/help-feedback">Help and Feedback</Link
          ><span>&nbsp;&nbsp;⸱&nbsp;&nbsp;</span>
          <Link href="/support-us">Support Us</Link>
          <span>&nbsp;&nbsp;⸱&nbsp;&nbsp;</span>
          <Link href="/terms-of-service">Terms of Service</Link>
        </section>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

.modal-content,
.settings-section {
  gap: 16px;
  display: flex;
  flex-direction: column;
  /* height: 100%; */
}

.modal-content {
  height: 100%;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  list-style: none;
  height: 36px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: calc(100%);
  position: relative;
  left: -16px;
  padding: 0 16px;
  transition: background-color 0.2s;

  a {
    color: theme.$md-sys-on-background;
    /* font-weight: bold; */
    height: 100%;
    line-height: 36px;
    width: 100%;
  }
}

li:hover {
  background: #ffffff33;
}

h2 {
  font-size: 1em;
  margin: 0;
  margin-bottom: -8px;
}

.links-section {
  font-weight: bold;
  display: flex;
  flex-direction: row;
  /* justify-content: center; */
}
</style>

<style lang="scss" src="scss/base/_modal.scss"></style>
