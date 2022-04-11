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
            <h3>Support Us</h3>
            To support Arcadecord, you can donate on Ko-fi or vote for us on top.gg
            <a href="/ko-fi">
            <Button>Donate</Button>
            </a>
              <a href="/top-gg">
                <Button>Vote</Button>
              </a>
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
