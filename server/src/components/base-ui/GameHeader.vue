<template>
  <div class="top">
    <div class="fabs">
      <button class="btn-fab" @click="openManual">
        <i class="material-icons">question_mark</i>
      </button>
      <transition name="fade" appear mode="out-in">
        <div class="hint" v-if="isitmyturn">{{ hint }}</div>
      </transition>
      <button class="btn-fab">
        <i class="material-icons">settings</i>
      </button>
    </div>
    <players-view></players-view>
  </div>
</template>

<script>
import bus from '@app/js/vue-event-bus.js'
import PlayersView from './PlayersView.vue'

export default {
  data() {
    return {}
  },
  props: ['hint', 'isitmyturn'],
  components: {
    PlayersView,
  },
  methods: {
    openManual() {
      console.log('open manual')
      bus.emit('open-manual')
    },
  },
}
</script>

<style lang="scss" scoped>
.hint {
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.top {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}
</style>