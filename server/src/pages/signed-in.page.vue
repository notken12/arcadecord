<!--
  sign-in-success.page.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->
<script setup>
import Header from 'components/index/Header.vue';
import Banner from 'components/index/Banner.vue';
import Content from 'components/index/Content.vue';
import Footer from 'components/index/Footer.vue';
import Button from 'components/index/Button.vue';
import LinkButton from 'components/index/LinkButton.vue';
import GameDisplay from 'components/index/GameDisplay.vue';
</script>

<template>
  <div class="container">
    <div class="flexElement">
      <h3>🔑 Signed in successfully!</h3>
      <h4>
        You can now close this tab and type /play in Discord to play a game.
      </h4>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

a:hover {
  text-decoration: none;
}

.flexElement {
  text-align: center;
  position: static;
  margin-left: auto;
  margin-right: auto;
  width: auto;
  height: auto;
}
</style>

<style lang="scss">
@use 'scss/base/pages';
</style>
