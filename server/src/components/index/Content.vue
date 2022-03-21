<template>
  <div class="content">
    <section class="stripe">
      Arcadecord is currently in beta. Feedback is greatly appreciated.
    </section>
    <section class="games"></section>
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
  justify-content: center;
  align-items: center;
  border-top: 1px #999 solid;
  box-sizing: border-box;
  // flex-wrap: wrap;

  img {
    display: block;
  }
}

.stripe {
  padding: 10px;
  background-color: #08234d;
  width: 100%;
  flex-direction: column;
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
  padding: 16px;
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
</style>
