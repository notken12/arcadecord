<!--
  Hero.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="hero">
    <div class="left">
      <h2 class="f1">Play games in your Discord messages!</h2>
      <h3>
        <span>Play classics inside any text channel. <br />Easy as add to server
          and</span>
        <div class="command">
          <img src="/icons/arcadecordicon.svg" alt="Arcadecord" class="icon" width="24" height="24" />
          <span class="mono">/play</span>
        </div>
        <span>.</span>
      </h3>
      <div class="buttons">
        <LinkButton icon="add" href="/invite" :gs="true">Add to Discord</LinkButton>

        <LinkButton outlined href="#features">See features</LinkButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/css/base/theme' as theme;

.hero {
  width: 100%;
  padding: var(--padding-x);
  overflow: hidden;
}

.left {
  display: flex;
  height: 30em;
  width: 100%;
  max-width: 500px;
  color: theme.$color-light;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
  justify-content: center;
}

@media only screen and (max-width: 990px) {
  .left {
    height: 60em;
    justify-content: flex-start;
  }
}

h2,
h3 {
  margin: 0;
  display: initial;
}

h2 {
  color: theme.$color;
  font-style: normal;
  font-weight: 700;
  font-size: 36px;
  line-height: 40px;
}

h3 {
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 30px;
  /* or 125% */

  letter-spacing: 0.1px;

  span {
    display: inline;
  }
}

.command {
  display: inline;
  flex-direction: row;
  // background: #424549;
  border-radius: 4px;
  gap: 8px;
  margin-left: 8px;
  // padding: 4px;

  img {
    border-radius: 100px;
    display: inline;
    vertical-align: middle;
    margin-top: -3px;
    margin-right: 8px;
  }
}

.buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

a,
a:hover {
  text-decoration: none !important;
}
</style>
