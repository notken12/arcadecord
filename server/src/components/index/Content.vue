<script setup>
import GameDisplay from './GameDisplay.vue'
import Button from './Button.vue'

defineProps({
  id: String,
})
</script>

<template>
  <div class="content" :id="id">
    <section class="stripe">
      Arcadecord is currently in beta. Feedback is greatly appreciated.
    </section>
    <section class="games">
      <GameDisplay game="8ball">8 Ball</GameDisplay>
      <GameDisplay game="cuppong">Cup Pong</GameDisplay>
      <GameDisplay game="seabattle">Sea Battle</GameDisplay>
      <GameDisplay game="4inarow">4 in a Row</GameDisplay>
      <GameDisplay game="chess">Chess</GameDisplay>
      <GameDisplay game="knockout">Knockout</GameDisplay>
      <GameDisplay game="filler">Filler</GameDisplay>
    </section>
    <section>
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
    <section class="reverse">
      <div class="text">
        <h3>Great for servers <br />big and small.</h3>
        <p>
          Whether you’re playing in a small server with your close friends or a
          large community server, your games will always easy to find and play.
          Arcadecord reduces the noise on large servers by making threads for
          each game.
        </p>
      </div>
      <div>
        <img src="" alt="" width="200" height="200" />
      </div>
    </section>
    <section>
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
    <section class="add">
      <h3>Add and play today for free!</h3>
      <a href="/invite">
        <Button icon="add">Add to Discord</Button>
      </a>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

.content {
  background: #1b1b1f;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  color: theme.$color-light;
  width: 100%;
}

section {
  padding: 64px var(--padding-x);
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;

  img {
    display: flex;
  }
}

.stripe {
  padding: 10px;
  background-color: #08234d;
  width: 100%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: none;
}

h3 {
  margin: 0;
  font-family: 'Work Sans', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 36px;
  line-height: 42px;
  display: flex;
  align-items: center;
  letter-spacing: 0.1px;
  color: theme.$color;
}

.games {
  padding: 16px var(--padding-x);
  flex-direction: row;
  display: flex;
  gap: 48px;
  border-top: 1px #999 solid;
  border-bottom: 1px #999 solid;
  flex-wrap: wrap;
  justify-content: center;
}

@media only screen and (max-width: 500px) {
  .games {
    gap: 32px !important;
  }
}

.text {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 32px;
}

p {
  margin: 0;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  /* or 171% */

  display: flex;
  align-items: center;
  letter-spacing: 0.1px;
}

.reverse {
  flex-direction: row-reverse;
}

.add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
</style>
