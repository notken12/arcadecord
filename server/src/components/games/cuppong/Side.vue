<script setup>
import Cup from './Cup.vue'

const props = defineProps({
    side: {
        type: Object,
        required: true
    }
})
</script>

<template>
    <Cup v-for="cup in side.cups" :cup="cup" :side="side" />
</template>