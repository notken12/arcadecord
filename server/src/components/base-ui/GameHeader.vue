<template>
  <div class="top">
    <div class="fabs">
      <button class="btn-fab" @click="openManual">
        <i class="material-icons">question_mark</i>
      </button>
      <transition name="fade" appear mode="out-in">
        <div class="hint" v-if="isitmyturn">{{ hint }}</div>
      </transition>
      <button class="btn-fab" style="margin-left: auto">
        <i class="material-icons">settings</i>
      </button>
    </div>
    <div>
      <players-view :players="game.players" :me="me"></players-view>
    </div>
  </div>
</template>

<script>
import bus from '@app/js/vue-event-bus.js'
import PlayersView from './PlayersView.vue'

export default {
  data() {
    return {}
  },
  props: ['game', 'me', 'hint', 'isitmyturn'],
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

<style lang="scss">
.hint {
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>