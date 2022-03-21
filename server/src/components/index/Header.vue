<script setup>
import Link from './Link.vue'
import Button from './Button.vue'
</script>

<template>
  <div class="header">
    <div class="logo">
      <img
        src="/icons/arcadecordicon.svg"
        alt="Arcadecord"
        class="icon"
        width="40"
        height="40"
        draggable="false"
      />
      <h1 class="app-name f1">Arcadecord</h1>
    </div>
    <div class="links">
      <Link href="/help">Help and feedback</Link>
      <Link href="/help">Support us</Link>
      <Link href="/help">Sign in</Link>
    </div>
    <a href="/invite">
      <Button icon="add">Add to Discord</Button>
    </a>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px var(--padding-x);
  width: 100%;
  gap: 32px;
  justify-content: space-between;
  user-select: none;
  overflow: auto;
}

.logo {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  height: 100%;
  gap: 16px;
}

.icon {
  border-radius: 100px;
}

.app-name {
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 28px;
  color: #ffffff;
  margin: 0;
}

.links {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 32px;
}

a {
  text-decoration: none;
}

@media only screen and (max-width: 840px) {
  .links {
    display: none;
  }
}

@media only screen and (max-width: 600px) {
  button {
    display: none;
  }
}
</style>

<style lang="scss">
@use 'scss/base/theme' as theme;
a:hover {
  color: theme.$color !important;
}
</style>
