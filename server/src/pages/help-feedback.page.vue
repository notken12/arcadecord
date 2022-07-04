<!--
  help-feedback.page.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import Header from 'components/index/Header.vue';
import Content from 'components/index/Content.vue';
import Footer from 'components/index/Footer.vue';
import Button from 'components/index/Button.vue';
import LinkButton from 'components/index/LinkButton.vue';
</script>

<template>
  <div class="container">
    <Header></Header>
    <Content id="features">
      <section>
        <h3>Help and feedback</h3>
        <p>
          Our official Discord server is the best place to get help and give
          feedback on Arcadecord, as well as stay up to date on news and
          upcoming features.
        </p>

        <LinkButton href="/discord-invite">Join Discord</LinkButton>

        <p>
          <span>Alternatively, you can email us at&nbsp;</span>
          <a href="mailto:arcadecordhelp@gmail.com">arcadecordhelp@gmail.com</a
          ><span>.</span>
        </p>
      </section>
      <!-- Horizontal -->
      <ins
        class="adsbygoogle"
        style="display: block; width: 100%"
        data-ad-client="ca-pub-9949308515923091"
        data-ad-slot="6224498898"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
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
