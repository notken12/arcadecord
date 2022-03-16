<template>
    <input type="checkbox" name="switch">
    <label for="switch"></label>
</template>

<style lang="scss" scoped>
label {
    position: relative;
    margin-bottom: 0;
    vertical-align: top;
    display: inline-block;
}

*, *::before, *::after {
    box-sizing: border-box;
}

label::before {
    left: -2.25rem;
    width: 1.75rem;
    pointer-events: all;
    border-radius: 0.5rem;
}

label::before, label {
    transition: background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}

label::before {
    position: absolute;
    top: 0.25rem;
    left: -1.5rem;
    display: block;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
    content: "";
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
    transition: background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out,-webkit-transform .15s ease-in-out;
    transition: transform .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    transition: transform .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out,-webkit-transform .15s ease-in-out;
}

label::after {
    position: absolute;
    top: 0.25rem;
    left: -1.5rem;
    display: block;
    width: 1rem;
    height: 1rem;
    content: "";
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
</style>