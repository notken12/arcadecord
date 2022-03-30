<!--  index.page.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.-->

<script setup>
import Banner from 'components/index/Banner.vue'
import Content from 'components/index/Content.vue'
import Footer from 'components/index/Footer.vue'
import Button from 'components/index/Button.vue'
import GameDisplay from 'components/index/GameDisplay.vue'
</script>

<template>
  <div class="container">
    <Banner></Banner>
    <Content id="features">
      <section class="stripe">
        Arcadecord is currently in beta. Feedback is greatly appreciated.
      </section>
      <section class="games row">
        <GameDisplay game="8ball">8 Ball</GameDisplay>
        <GameDisplay game="cuppong">Cup Pong</GameDisplay>
        <GameDisplay game="seabattle">Sea Battle</GameDisplay>
        <GameDisplay game="4inarow">4 in a Row</GameDisplay>
        <GameDisplay game="chess">Chess</GameDisplay>
        <GameDisplay game="knockout">Knockout</GameDisplay>
        <GameDisplay game="filler">Filler</GameDisplay>
      </section>
      <section class="row">
        <div class="text">
          <h3>Your favorite games, <br />in your favorite servers.</h3>
          <p>
            Play with anyone, on any device. Arcadecord has a rich and growing
            collection of games. Play with randoms on your server or invite your
            best friends only.
          </p>
        </div>
        <div>
          <img src="" alt="" width="200" height="200" />
        </div>
      </section>
      <section class="row-reverse">
        <div class="text">
          <h3>Great for servers <br />big and small.</h3>
          <p>
            Whether you’re playing in a small server with your close friends or
            a large community server, your games will always easy to find and
            play. Arcadecord reduces the noise on large servers by making
            threads for each game.
          </p>
        </div>
        <div>
          <img src="" alt="" width="200" height="200" />
        </div>
      </section>
      <section class="row">
        <div class="text">
          <h3>Play on any device, <br />no installation necessary.</h3>
          <p>
            Arcadecord games are played in your browser, so you don’t need to
            install anything. No need to worry about what platform your friend
            uses, just play!
          </p>
        </div>
        <div>
          <img src="" alt="" width="200" height="200" />
        </div>
      </section>
      <section class="row add">
        <h3>Add and play today for free!</h3>
        <a href="/invite">
          <Button icon="add">Add to Discord</Button>
        </a>
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
</style>

<style lang="scss">
@use 'scss/base/pages';
</style>
