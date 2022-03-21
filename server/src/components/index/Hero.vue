<script setup>
import Button from './Button.vue'
</script>

<template>
  <div class="hero">
    <div class="left">
      <h2 class="f1">Play games in your Discord messages!</h2>
      <h3>
        <span
          >Play classics inside any text channel. Easy as add to server
          and</span
        >
        <div class="command">
          <img
            src="/icons/arcadecordicon.svg"
            alt="Arcadecord"
            class="icon"
            width="24"
          />
          <span class="mono">/play</span>
        </div>
        <span>.</span>
      </h3>
      <div class="buttons">
        <Button icon="add">Add to Discord</Button>
        <Button outlined>See features</Button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

.hero {
  width: 100%;
  padding: var(--padding-x);
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

h2,
h3 {
  margin: 0;
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
  justify-content: center;
  gap: 16px;
}
</style>
