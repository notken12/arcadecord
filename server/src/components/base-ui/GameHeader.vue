<template>
  <div class="top">
    <div class="fabs">
      <button class="btn-fab" @click="openManual">
        <i class="material-icons">question_mark</i>
      </button>
      <button class="btn-fab" style="margin-left: auto">
        <i class="material-icons">settings</i>
      </button>
    </div>
    <div class="hint">{{ hint }}</div>
    <div>
      <players-view :players="game.players" :me="me"></players-view>
    </div>
  </div>
</template>

<script>
import bus from '@app/js/vue-event-bus.js';
import PlayersView from './PlayersView.vue'

export default {
  data() {
    return {}
  },
  props: ['game', 'me', 'hint'],
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