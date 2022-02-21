<template>
    <GameComponent></GameComponent>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
const props = defineProps({
    gameType: {
        type: String,
        required: true
    }
})

// const GameComponent = await import(`../components/games/${props.gameType}/App.vue`);

const GameComponent = defineAsyncComponent(() =>
    import(`../components/games/${props.gameType}/App.vue`)
)
</script>

<style lang="scss" src="scss/all-games.scss"></style>