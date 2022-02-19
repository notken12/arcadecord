<template>
    <component :is="GameComponent"></component>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
const props = defineProps({
    gameType: {
        type: String,
        required: true
    }
})

const GameComponent = defineAsyncComponent(() =>
    import(`../components/games/${props.gameType}/App.vue`)
)
</script>