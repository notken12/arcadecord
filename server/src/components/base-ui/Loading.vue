<template>
    <div v-if="loading">
        Loading...
    </div>
</template>

<script>
export default {
    data() {
        return {
            loading: true
        }
    }
}
</script>