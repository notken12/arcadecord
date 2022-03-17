<template>
  <div class="placed-ship" :style="styles" :class="classes" ref="el">
    <img draggable="false" :src="imgURL" class="placed-ship-image" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFacade } from '@app/components/base-ui/facade'
import Common from '/gamecommons/seabattle'
import gsap from 'gsap'

const { game } = useFacade()

const rotations = [-90, 0, 90, 180]

const props = defineProps({
  ship: {
    type: Object,
    required: true,
  },
  selected: Boolean,
  board: {
    type: Object,
  },
})

const el = ref(null)

const classes = computed(() => {
  return props.selected ? 'selected' : ''
})

const styles = computed(() => {
  return {
    'transform-origin': `${50 / props.ship.len}% 50%`,
  }
})

const imgURL = computed(() => {
  var ship = props.ship
  var shipType = ship.type
  return '/dist/assets/seabattle/ships/' + shipType + '.png'
})

const updatePos = (animate) => {
  gsap.to(el.value, {
    duration: animate ? 0.3 : 0,
    rotation: rotations[props.ship.dir],
    x: (props.ship.col * 100) / props.ship.len + '%',
    y: props.ship.row * 100 + '%',
  })
}

onMounted(() => {
  updatePos()
})

watch(
  () => props.ship,
  () => {
    updatePos(true)
  },
  { deep: true }
)

// const imgStyles = computed(() => {
//   var ship = props.ship

//   var x = ship.x * Common.CELL_SIZE
//   var y = ship.y * Common.CELL_SIZE
//   var width = ship.length * Common.CELL_SIZE
//   var height = Common.CELL_SIZE

//   return {
//     left: x + 'px',
//     top: y + 'px',
//     width: width + 'px',
//     height: height + 'px',
//   }
// })
</script>

<style lang="scss">
.placed-ship {
  position: absolute;
  height: 10%;
}

.placed-ship-image {
  width: 100%;
  height: 100%;
}
</style>
