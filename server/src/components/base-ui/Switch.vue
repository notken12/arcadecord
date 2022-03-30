<!--
  Switch.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { computed } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
</script>

<template>
  <div class="switch">
    <input type="checkbox" id="switch" v-model="value" />
    <label for="switch"><slot></slot></label>
  </div>
</template>

<style lang="scss" scoped>
label {
  position: relative;
  margin-bottom: 0;
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  cursor: pointer;
  height: 100%;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

label::before,
label {
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

label::before {
  display: block;
  // width: 1rem;
  height: 1.5rem;
  width: 2.5rem;
  pointer-events: none;
  content: '';
  background-color: #333;
  pointer-events: all;
  border-radius: 10rem;
  font-size: 23px;
  border: #adb5bd solid 1px;
}

label::after {
  position: absolute;
  display: block;
  content: '';
  background: 50% / 50% 50% no-repeat;
  border: 1px gray solid;
  left: 0;
  width: 1.5rem;
  height: 1.5rem;
  background-color: white;
  border-radius: 3rem;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out, -webkit-transform 0.15s ease-in-out;
  transition: transform 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  transition: transform 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out,
    -webkit-transform 0.15s ease-in-out;
}

input:checked ~ label::after {
  background-color: #fff;
  -webkit-transform: translateX(1rem);
  transform: translateX(1rem);
}

input:checked ~ label::before {
  color: #fff;
  border-color: #0077ff;
  background-color: #0077ff;
}

input {
  pointer-events: none;
  opacity: 0;
  box-sizing: border-box;
  padding: 0;
  overflow: visible;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  margin-left: 8px;
  height: 0;
}

.switch {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  height: 100%;
  width: 100%;
}
</style>
