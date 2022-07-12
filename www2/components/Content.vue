<!--
  Content.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import GameDisplay from './GameDisplay.vue'
import Button from './Button.vue'

defineProps({
  id: String,
})
</script>

<template>
  <div class="content" :id="id">
    <slot></slot>
  </div>
</template>

<style lang="scss">
@use '~/assets/css/base/theme' as theme;

.content {
  background: #1b1b1f;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  color: theme.$color-light;
  width: 100%;
}

section {
  padding: 32px var(--padding-x);
  width: 100%;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  display: flex;
  gap: 16px;
}

.image {
  width: 100%;
  display: flex;
  max-width: 500px;

  img {
    display: flex;
    width: 100%;
    height: 100%;
  }
}

.text {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 32px;
}

.stripe {
  padding: 10px 16px;
  background-color: #08234d;
  width: 100%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: none;
}

h3 {
  margin: 0;
  font-family: 'Work Sans', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 36px;
  line-height: 42px;
  display: flex;
  align-items: center;
  letter-spacing: 0.1px;
  color: theme.$color;
}

.games {
  padding: 16px var(--padding-x);
  flex-direction: row !important;
  display: flex;
  gap: 48px;
  border-top: 1px #999 solid;
  border-bottom: 1px #999 solid;
  flex-wrap: wrap;
  justify-content: center;
}

@media only screen and (max-width: 500px) {
  .games {
    gap: 32px !important;
  }
}

p {
  margin: 0;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  /* or 171% */

  display: flex;
  align-items: center;
  letter-spacing: 0.1px;
}

.row {
  flex-direction: row;
  align-items: center;
}

.row-reverse {
  align-items: center;
  flex-direction: row-reverse;
}

@media only screen and (max-width: 820px) {

  .row,
  .row-reverse {
    flex-direction: column;
  }
}

.add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.spacer {
  width: 100%;
  height: 32px;
}
</style>
