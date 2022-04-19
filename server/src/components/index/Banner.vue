<!--
  Banner.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import Header from './Header.vue';
import Hero from './Hero.vue';
</script>

<template>
  <div class="banner">
    <Header></Header>
    <Hero></Hero>
  </div>
</template>

<style lang="scss" scoped>
.banner {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  background: linear-gradient(
    257.44deg,
    #1e5dbc 2.01%,
    rgba(0, 61, 152, 0.35) 98.51%
  );
}
</style>
