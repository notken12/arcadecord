<script setup>
import Banner from 'components/index/Banner.vue'
import Content from 'components/index/Content.vue'
import Footer from 'components/index/Footer.vue'
</script>

<template>
  <div class="container">
    <Banner></Banner>
    <Content id="features"></Content>
    <Footer></Footer>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  width: 100%;
  height: 100%;
  background: #1b1b1f;
}
</style>

<style lang="scss">
@use 'scss/base/theme' as theme;

@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@500&family=Inter:wght@400;500;700&family=Work+Sans:wght@400;500;700&display=swap');

body,
html,
#app {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  width: 100%;
  // scroll-behavior: smooth;
  color: theme.$color-light;
  background: #1b1b1f;
}

html {
  --padding-x: 48px;
}

.f1 {
  font-family: 'Work Sans', sans-serif;
}

.f2 {
  font-family: 'Inter', sans-serif;
}

.xlight {
  color: theme.$color-xlight;
}

* {
  box-sizing: border-box;
}

.mono {
  font-family: 'Inconsolata', monospace;
}

@media only screen and (max-width: 600px) {
  html {
    --padding-x: 16px;
  }
}

a {
  text-decoration: none;
}

p {
  margin: 0;
}
</style>
