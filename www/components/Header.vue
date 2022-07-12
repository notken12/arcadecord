<!--
  Header.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<template>
  <div class="header">
    <Logo></Logo>
    <div class="right">
      <div class="links">
        <Link href="/help-feedback">Help and feedback</Link>
        <Link href="/support-us">Support us</Link>
        <Link href="/sign-in" :gs="true">Sign in</Link>
      </div>
      <LinkButton href="/invite" icon="add" :gs="true">Add to Discord</LinkButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/css/base/theme' as theme;

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px var(--padding-x);
  width: 100%;
  gap: 32px;
  justify-content: space-between;
  user-select: none;
  overflow: hidden;

  a {
    font-weight: normal;
  }
}

.right {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 32px;
}

.links {
  display: flex;
  gap: 32px;
}

@media only screen and (max-width: 840px) {
  .links {
    display: none;
  }
}

@media only screen and (max-width: 450px) {
  .button {
    display: none;
  }
}
</style>

<style lang="scss">
@use '~/assets/css/base/theme' as theme;

a:hover {
  color: theme.$color  !important;
}
</style>
