<!--  Logo.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.-->

<template>
  <a class="logo" href="/">
    <img
      src="/icons/arcadecordicon.svg"
      alt="Arcadecord"
      class="icon"
      width="40"
      height="40"
      draggable="false"
    />
    <h1 class="app-name f1">Arcadecord</h1>
  </a>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

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

a {
  color: theme.$color;
}
</style>
