<!--
  contact-us.page.vue - Arcadecord

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

import { useAppInsights } from '@app/components/base-ui/app-insights';

useAppInsights();
</script>

<template>
  <div class="container">
    <Header></Header>
    <Content id="features">
      <section>
        <h3>Contact us</h3>
        <p>
          The best place to interact with our team (as well as chat and play
          games with others in the community) is through the official Arcadecord
          Discord server.
        </p>
        <LinkButton href="/discord-invite"> Join Discord </LinkButton>
        <p>
          Alternatively, contact us through our email address at&nbsp
          <a href="mailto:contactarcadecord@gmail.com">contactarcadecord@gmail.com</a>.
        </p>
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
