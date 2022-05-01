<!--
  Footer.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import Logo from './Logo.vue';
import Link from './Link.vue';
</script>

<template>
  <div class="footer">
    <div class="left">
      <Logo></Logo>
      <p class="f1">Message games for Discord</p>
      <p class="xlight">Copyright © 2022 Arcadecord</p>
    </div>
    <div class="right">
      <Link href="/team">Our team</Link>
      <Link href="/support-us">Support us</Link>
      <Link href="/help-feedback">Help and feedback</Link>
      <Link href="/server">Support server</Link>
      <Link href="/contact-us">Contact us</Link>
      <Link href="/terms-of-service">Terms of service</Link>
      <Link href="/privacy-policy">Privacy policy</Link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  background: #212739;
  padding: 32px var(--padding-x);
  flex-wrap: wrap-reverse;
  gap: 32px;
  max-width: 100%;
  height: 100%;
}

div {
  display: flex;
}

.left {
  flex-direction: column;
  gap: 16px;
}

.right {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  grid-auto-rows: auto;

  div {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  a {
    width: minmax(120px, 1fr);
  }
}
</style>
