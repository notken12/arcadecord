<!--  Side.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.-->

<script setup>
import Cup from './Cup.vue'

const props = defineProps({
  side: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <Cup v-for="cup in side.cups" :cup="cup" :side="side" />
</template>
