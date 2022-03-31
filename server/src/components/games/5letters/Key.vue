<script setup>
import { computed } from 'vue'

const props = defineProps({
  kbkey: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['press'])

const icons = {
  enter: 'keyboard_return',
  backspace: 'backspace',
}

const styles = computed(() => {
  let key = props.kbkey
  let styles = {
    opacity: !key.key ? 0 : 1,
    cursor: !key.key ? 'default' : 'pointer',
    flex: key.width ?? 1,
  }

  if (styles.flex == 0.5) {
    styles.margin = '0'
  }

  return styles
})

const pressKey = () => {
  emit('press', props.kbkey)
}
</script>

<template>
  <div
    class="key"
    :class="{
      enter: kbkey.key === 'enter',
      backspace: kbkey.key === 'backspace',
      end: kbkey.end,
    }"
    :style="styles"
    @click="pressKey()"
  >
    <i
      class="material-icons"
      v-if="kbkey.key === 'backspace' || kbkey.key === 'enter'"
      >{{ icons[kbkey.key.toLowerCase()] }}</i
    >
    <span v-else>
      {{ kbkey.key }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;

$gap: 6px;

.key {
  font-family: inherit;
  font-weight: bold;
  border: none;
  padding: 0;
  height: 58px;
  border-radius: 4px;
  margin-right: $gap;
  cursor: pointer;
  user-select: none;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.3);
  background: #444;
}

.end {
  margin-right: 0;
}

.enter {
  color: theme.$md-sys-on-primary;
  background-color: theme.$md-sys-primary;
}

.backspace {
  background: #622d31;
  font-family: 'Material Icons';
}
</style>
