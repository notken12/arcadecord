<!--  help-feedback.page.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.-->

<script setup>
import Header from 'components/index/Header.vue'
import Content from 'components/index/Content.vue'
import Footer from 'components/index/Footer.vue'
import Button from 'components/index/Button.vue'
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
        <a href="/discord-invite-link">
          <Button>Join Discord</Button>
        </a>
        <p>
          <span>Alternatively, you can email us at&nbsp;</span>
          <a href="mailto:help@arcadecord.io">help@arcadecord.io</a
          ><span>.</span>
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
