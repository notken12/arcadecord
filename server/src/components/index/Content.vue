<!--  Content.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.-->

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
@use 'scss/base/theme' as theme;

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
  padding: 64px var(--padding-x);
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  img {
    display: flex;
  }
}

.stripe {
  padding: 10px;
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
  flex-direction: row;
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

.text {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 32px;
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

.add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
</style>
