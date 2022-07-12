<!--
  index.page.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="container">
    <Banner></Banner>
    <Content id="features">
      <section class="stripe">
        Arcadecord is currently in beta. Please pardon our dust, and feedback is
        greatly appreciated.
      </section>
      <!-- <section class="stripe"> -->
      <!--   ✨ Note: We are popular! In a few days, Arcadecord has been added to 100 -->
      <!--   servers! <br />Thank you for the love, please bear with us while we are -->
      <!--   trying to complete the review process required by Discord.<br /> -->
      <!--   Once it is done, you will be able to add it to your servers. Be sure to -->
      <!--   check back in a few days. -->
      <!-- </section> -->
      <section class="games row">
        <GameDisplay game="8ball">8 Ball</GameDisplay>
        <GameDisplay game="cuppong">Cup Pong</GameDisplay>
        <GameDisplay game="5letters">5 Letters</GameDisplay>
        <GameDisplay game="knockout">Knockout</GameDisplay>
        <GameDisplay game="seabattle">Sea Battle</GameDisplay>
        <GameDisplay game="4inarow">4 in a Row</GameDisplay>
        <GameDisplay game="chess">Chess</GameDisplay>
        <GameDisplay game="filler">Filler</GameDisplay>
      </section>
      <section class="row">
        <!-- Horizontal -->
        <ins
          class="adsbygoogle"
          style="display: block; width: 100%; height: 90px"
          data-ad-client="ca-pub-9949308515923091"
          data-ad-slot="6224498898"
          data-ad-format="fluid"
          data-full-width-responsive="true"
        ></ins>
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
        <div class="image">
          <img src="/images/pic1.png" alt="" />
        </div>
      </section>
      <section class="row-reverse">
        <div class="text">
          <h3>Play on any device, <br />no installation necessary.</h3>
          <p>
            Arcadecord games are played in your browser, so you don’t need to
            install anything. No need to worry about what platform your friend
            uses, just play!
          </p>
        </div>
        <div class="image">
          <img src="/images/pic2.png" alt="" />
        </div>
      </section>
      <section class="row">
        <div class="text">
          <h3>Great for servers <br />big and small.</h3>
          <p>
            Whether you’re playing in a small server with your close friends or
            a large community server, your games will always easy to find and
            play. Arcadecord reduces the noise on large servers by making
            threads for each game.
          </p>
        </div>
        <div class="image">
          <img src="/images/pic3.png" alt="" />
        </div>
      </section>
      <section class="row add">
        <h3>Add and play today for free!</h3>
        <LinkButton href="/invite" icon="add">Add to Discord</LinkButton>
      </section>
      <section class="row">
        <!-- Horizontal -->
        <ins
          class="adsbygoogle"
          style="display: block; width: 100%; height: 140px"
          data-ad-client="ca-pub-9949308515923091"
          data-ad-slot="6224498898"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </section>
      <div class="spacer"></div>
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
@use '~/assets/css/base/pages';

#app {
  background: #1b1b1f;
}

* {
  scroll-behavior: smooth;
}

section {
  gap: 64px;
}
</style>
