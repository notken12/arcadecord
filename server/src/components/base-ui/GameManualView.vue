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

<style lang="scss">
@use '../../scss/base/_theme.scss' as theme;

.game-manual-bg {
  width: 100%;
  position: absolute;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 11;
}

.game-manual-modal {
  width: 100%;
  height: 100%;
  background-color: theme.$md-sys-surface;
  color: theme.$md-sys-on-surface;
  overflow-y: auto;
}

.game-manual-modal-header {
  display: flex;
  flex-direction: row;
  height: 64px;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  position: fixed;
  background-color: theme.$md-sys-surface;
  width: 100%;
  box-shadow: theme.$md-elevation-level3;
}

.game-manual-modal-header .btn-icon {
  background-color: transparent;
  border: none;
  box-shadow: none;
  color: theme.$md-sys-on-surface;
  padding: 0;
  min-width: 24px;
  min-height: 24px;
  width: 24px;
  height: 24px;
}

.game-manual-modal-header-text {
  font-size: theme.$md-sys-typescale-headline5-size;
  font-family: theme.$md-sys-typescale-headline5-font;
  font-weight: theme.$md-sys-typescale-headline5-weight;
  line-height: theme.$md-sys-typescale-headline5-line-height;
}

.game-manual-modal-content {
  padding: 16px;
  margin-top: 64px;
}
</style>