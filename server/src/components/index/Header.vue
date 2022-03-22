<script setup>
import Link from './Link.vue'
import Button from './Button.vue'
import Logo from './Logo.vue'
</script>

<template>
  <div class="header">
    <Logo></Logo>
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
