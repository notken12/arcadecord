<template>
  <div class="switch">
    <input type="checkbox" name="switch" />
    <label for="switch"><slot></slot></label>
  </div>
</template>

<style lang="scss" scoped>
label {
  position: relative;
  margin-bottom: 0;
  vertical-align: top;
  display: inline-block;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

label::before {
  left: -2.25rem;
  width: 1.75rem;
  pointer-events: all;
  border-radius: 0.5rem;
  font-size: 23px;
}

label::before,
label {
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

label::before {
  position: absolute;
  top: 0.25rem;
  left: -1.5rem;
  display: block;
  // width: 1rem;
  height: 1rem;
  pointer-events: none;
  content: '';
  background-color: #fff;
  border: #adb5bd solid 1px;
}

label::after {
  top: calc(0.25rem + 2px);
  left: calc(-2.25rem + 2px);
  width: calc(1rem - 4px);
  height: calc(1rem - 4px);
  background-color: #adb5bd;
  border-radius: 0.5rem;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out, -webkit-transform 0.15s ease-in-out;
  transition: transform 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  transition: transform 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out,
    -webkit-transform 0.15s ease-in-out;
}

label::after {
  position: absolute;
  top: 0.25rem;
  left: -1.5rem;
  display: block;
  width: 1rem;
  height: 1rem;
  content: '';
  background: 50% / 50% 50% no-repeat;
}

input:checked ~ label::after {
  background-color: #fff;
  -webkit-transform: translateX(0.75rem);
  transform: translateX(0.75rem);
}

input:checked ~ label::before {
  color: #fff;
  border-color: #007bff;
  background-color: #007bff;
}

input {
  position: absolute;
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
}

.switch {
//   position: absolute;
  left: 0;
//   z-index: -1;
  width: 1rem;
  height: 1.25rem;
//   opacity: 0;
}
</style>
