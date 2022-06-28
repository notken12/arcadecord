<!--
  Key.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { computed, watch, ref } from 'vue';
import Common from '/gamecommons/5letters';
import { letterAnimationLength } from '@app/js/games/5letters/constants';

const props = defineProps({
  kbkey: {
    type: Object,
    required: true,
  },
  hint: Number,
});

const emit = defineEmits(['press']);

const hint = ref(undefined);
hint.value = props.hint;

const changed = ref(false);

const icons = {
  enter: 'keyboard_return',
  backspace: 'backspace',
};

const styles = computed(() => {
  let key = props.kbkey;
  let styles = {
    opacity: !key.key ? 0 : 1,
    cursor: !key.key ? 'default' : 'pointer',
    flex: key.width ?? 1,
    transition: changed.value ? 'background-color 0.2s' : 'none',
    transitionDelay: changed.value ? letterAnimationLength * 5 + 'ms' : '0',
  };

  if (styles.flex == 0.5) {
    styles.margin = '0';
  }

  return styles;
});

const pressKey = () => {
  emit('press', props.kbkey);
};

watch(
  () => props.hint,
  (newVal, oldVal) => {
    if (newVal === oldVal) return;
    changed.value = true;
    hint.value = newVal;
  }
);

const classes = computed(() => {
  let key = props.kbkey;
  let classes = {
    enter: key.key === 'enter',
    backspace: key.key === 'backspace',
    end: key.end,
    wrong: hint.value === Common.HINT.WRONG,
    correct: hint.value === Common.HINT.CORRECT,
    elsewhere: hint.value === Common.HINT.ELSEWHERE,
  };

  return classes;
});
</script>

<template>
  <div class="key" :class="classes" :style="styles" @click="pressKey()">
    <i
      class="material-icons"
      v-if="kbkey.key === 'backspace' || kbkey.key === 'enter'"
      >{{ icons[kbkey.key.toLowerCase()] }}</i
    >
    <span v-if="kbkey.key !== 'backspace' && kbkey.key !== 'enter'">
      {{ kbkey.key }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
@use 'scss/base/theme' as theme;
@use 'scss/games/5letters.scss' as *;

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
  background: #555;
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

.wrong {
  background: $wrong-color;
}

.elsewhere {
  background: $elsewhere-color;
}

.correct {
  background: $correct-color;
}
</style>
