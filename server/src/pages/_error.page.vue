<template>
    <div></div>
</template>

<script setup>
import { computed, inject } from 'vue'
const pageContext = inject('pageContext')

const errorText = computed(() => {
    if (pageContext.is404) {
        return 'Page not found'
    } else {
        return pageContext.errorInfo || 'Something went wrong'
    }
})
</script>