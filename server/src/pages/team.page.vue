<script setup>
import Header from 'components/index/Header.vue';
import Content from 'components/index/Content.vue';
import Footer from 'components/index/Footer.vue';
import Card from 'components/index/Card.vue';
import Link from 'components/index/Link.vue';
</script>

<template>
  <div class="container">
    <Header></Header>
    <Content id="content">
      <section>
        <h3>Our team</h3>
        <p>
          If you're interested in joining our team and helping build and grow
          Arcadecord, please
          <Link href="mailto:contact@arcadecord.com">contact us by email</Link>!
          We would be glad to welcome new members to the Arcadecord team.
        </p>
        <Card title="Ken">
          Creator of the Arcadecord project and the main developer behind it.
          <code>notken12#0898</code> on Discord.
        </Card>
        <Card title="Seth"> Contributor to Arcadecord's code and art. </Card>
        <Card title="Craz">Contributor to Arcadecord's code.</Card>
      </section>
    </Content>
    <Footer></Footer>
  </div>
</template>

<style lang="scss">
@use 'scss/base/pages';

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 100%;
  background: #1b1b1f;
}

a {
  display: inline;
}

p {
  display: inline;
}
</style>

<!-- <style lang="scss"> -->
<!-- @use 'scss/base/pages'; -->
<!-- </style> -->
