<template>
    <div>{{ errorText }}</div>
</template>

<script setup>
import { computed, inject, onMounted } from 'vue'
const pageContext = inject('pageContext')

const errorText = computed(() => {
    if (pageContext.errorInfo) {
        return pageContext.errorInfo
    }
    if (pageContext.is404) {
        return 'Page not found'
    }
    return 'Something went wrong'
})

onMounted(() => {
    console.log(pageContext)
})
</script>