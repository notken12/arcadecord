<script setup>
import Header from 'components/index/Header.vue';
import Content from 'components/index/Content.vue';
import Footer from 'components/index/Footer.vue';
import Button from 'components/index/Button.vue';
import LinkButton from 'components/index/LinkButton.vue';

const props = defineProps({
  server: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="container">
    <Header></Header>
    <Content>
      <div class="server-header">
        <img
          :src="server.iconURL"
          alt="Server Icon"
          class="server-icon"
          width="48"
          height="48"
        />
        <h2>
          {{ server.name }}
        </h2>
      </div>
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

.server-header {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
}

.server-icon {
  border-radius: 100px;
}
</style>

<style lang="scss">
@use 'scss/base/pages';
</style>
