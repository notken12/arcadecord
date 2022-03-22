<script setup>
import Logo from './Logo.vue'
</script>

<template>
  <div class="footer">
    <div class="left">
      <Logo></Logo>
      <p class="f1">Message games for Discord</p>
      <p class="xlight">Copyright © 2022 Arcadecord</p>
    </div>
    <div></div>
  </div>
</template>

<style lang="scss" scoped>
.footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  background: #212739;
  padding: var(--padding-x);
}

div {
  display: flex;
}

.left {
  flex-direction: column;
  gap: 16px;
}
</style>
