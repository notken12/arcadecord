<template>
  <div class="game-manual-bg">
    <div class="game-manual-modal">
      <div class="game-manual-modal-header">
        <div class="game-manual-modal-header-close">
          <button class="btn-icon" @click="closeManual">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="game-manual-modal-header-text">
          <span>Game Manual</span>
        </div>
      </div>
      <div class="game-manual-modal-content">
        <div v-if="parsedMarkdown === undefined">Loading...</div>
        <div v-if="parsedMarkdown === null">
          Game manual for {{ game.name }} coming soon!
        </div>
        <div v-html="parsedMarkdown" v-if="parsedMarkdown"></div>
      </div>
    </div>
  </div>
</template>

<script>
import bus from '@app/js/vue-event-bus.js'
import { Remarkable } from 'remarkable'

var { manualMd } = bus

var md = new Remarkable({})

export default {
  data() {
    return {
      parsedMarkdown: undefined,
    }
  },
  props: ['game'],
  methods: {
    closeManual() {
      bus.emit('close-manual')
    },
  },
  mounted() {
    if (this.manualMd !== undefined) {
      // manual already loaded
      this.parsedMarkdown = manualMd
    } else {
      // manual not loaded yet
      // fetch and parse manual
      var path = '/dist/manuals/' + this.game.typeId + '.md'
      fetch(path)
        .then((response) => {
          if (response.ok) {
            response.text().then((text) => {
              this.parsedMarkdown = md.render(text)
              manualMd = this.parsedMarkdown
            })
          } else {
            this.parsedMarkdown = null
            manualMd = null
          }
        })
        .catch(() => {
          this.parsedMarkdown = null
          manualMd = null
        })
    }
  },
}
</script>