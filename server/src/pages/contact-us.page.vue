<script setup>
import Header from 'components/index/Header.vue'
import Banner from 'components/index/Banner.vue'
import Content from 'components/index/Content.vue'
import Footer from 'components/index/Footer.vue'
import Button from 'components/index/Button.vue'
import GameDisplay from 'components/index/GameDisplay.vue'
</script>

<template>
    <div class="container">
        <Header></Header>
        <Content id="features">
          <section>
          
          </section>
      </Content>
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

a:hover {
  text-decoration: none;
}
</style>

<style lang="scss">
@use 'scss/base/pages';
</style>
