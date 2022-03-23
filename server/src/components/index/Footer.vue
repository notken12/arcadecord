<script setup>
import Logo from './Logo.vue'
import Link from './Link.vue'
</script>

<template>
  <div class="footer">
    <div class="left">
      <Logo></Logo>
      <p class="f1">Message games for Discord</p>
      <p class="xlight">Copyright © 2022 Arcadecord</p>
    </div>
    <div class="right">
      <div>
        <Link href="/team">Our team</Link>
        <Link href="/support-us">Support us</Link>
      </div>
      <div>
        <Link href="/help">Help and feedback</Link>
        <Link href="/server">Support server</Link>
        <Link href="/contact">Contact us</Link>
      </div>
      <div>
        <Link href="/terms-of-service">Terms of service</Link>
        <Link href="/privacy-policy">Privacy policy</Link>
      </div>
    </div>
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

.right {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 32px;

  div {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
