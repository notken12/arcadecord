<!--  Loading.page.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.-->

<template>
  <div v-if="loading" class="container">
    <span>Loading...</span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
    }
  },
}
</script>

<style lang="scss" scoped>
@use 'scss/base/_theme.scss' as theme;

.container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: theme.$md-sys-background;
  color: theme.$md-sys-on-background;
  font-family: theme.$md-sys-typescale-body1-font, sans-serif;
  font-size: theme.$md-sys-typescale-body1-size;
}
</style>
