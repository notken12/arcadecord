<!--
  support-us.page.vue - Arcadecord

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
    <Header></Header>
    <Content id="content">
      <section>
        <h3>Support us</h3>
        <h4>Ko-fi</h4>
        <p>
          You can donate on Ko-fi to help support Arcadecord. We're a small team
          working for free, and any donations will help keep the project going.
          Every $1 makes a difference. Thank you so much for your consideration!
        </p>
        <LinkButton href="/ko-fi">Ko-Fi</LinkButton>
        <h4>top.gg</h4>
        <p>
          If you're enjoying Arcadecord, please vote for us on top.gg! It helps
          other people discover our bot and it's free! You can vote every 12
          hours. Thank you! &lt;3
        </p>
        <LinkButton href="/top-gg">Vote</LinkButton>
        <!-- Horizontal -->
        <ins
          class="adsbygoogle"
          style="display: block; width: 100%"
          data-ad-client="ca-pub-9949308515923091"
          data-ad-slot="6224498898"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </section>
    </Content>
    <Footer></Footer>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 100%;
  background: #1b1b1f;
}

a:hover {
  text-decoration: none;
}
</style>

<style lang="scss">
@use 'scss/base/pages';
</style>
