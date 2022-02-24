<template>
    <div>{{ errorText }}</div>
</template>

<script setup>
import { computed, inject } from 'vue'
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
</script>