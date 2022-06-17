<!--
  team.page.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

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
          Arcadecord, please contact us by email at
          <Link href="mailto:contactarcadecord@gmail.com"
            >contactarcadecord@gmail.com</Link
          >! We're in need of more developers and artists and would be glad to
          welcome new members to the Arcadecord team.
        </p>
        <Card>
          <template v-slot:title>
            <img
              src="/profile-pictures/notken12.jpg"
              alt="Profile picture"
              class="pfp"
            />
            Ken
          </template>
          <div>
            Creator of the Arcadecord project and the main developer behind it.
            <code>notken12#0898</code> on Discord.
          </div>
          <div>
            <Link href="https://github.com/notken12">
              <img
                src="/GitHub-Mark/PNG/GitHub-Mark-Light-32px.png"
                alt="Github Mark"
                width="24"
                height="24"
                style="display: inline-block"
              />
              GitHub
            </Link>
          </div>
        </Card>
        <Card>
          <template v-slot:title>
            <img
              src="/profile-pictures/SethDevsStuff.jpg"
              alt="Profile picture"
              class="pfp"
            />
            Seth
          </template>
          <div>Contributor to Arcadecord's code and art.</div>
          <div>
            <Link href="https://github.com/SethDevsStuff">
              <img
                src="/GitHub-Mark/PNG/GitHub-Mark-Light-32px.png"
                alt="Github Mark"
                width="24"
                height="24"
                style="display: inline-block"
              />
              GitHub
            </Link>
          </div>
        </Card>
        <Card>
          <template v-slot:title>
            <img
              src="/profile-pictures/Crazexpert.jpg"
              alt="Profile picture"
              class="pfp"
            />
            Craz
          </template>
          <div>Contributor to Arcadecord's code.</div>
          <div>
            <Link href="https://github.com/Crazexpert">
              <img
                src="/GitHub-Mark/PNG/GitHub-Mark-Light-32px.png"
                alt="Github Mark"
                width="24"
                height="24"
                style="display: inline-block"
              />
              GitHub
            </Link>
          </div>
        </Card>
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

$pfp-size: 32px;

.pfp {
  width: $pfp-size;
  height: $pfp-size;
  border-radius: 100px;
}

a {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  /* width: 0; */
}

p {
  display: block;

  a {
    display: inline;
  }
}
</style>

<!-- <style lang="scss"> -->
<!-- @use 'scss/base/pages'; -->
<!-- </style> -->
