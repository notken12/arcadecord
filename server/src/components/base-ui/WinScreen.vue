<template>
  <div class="win-view dialog-container">
    <div class="win-view-chip dialog-chip" @click="showConfetti">
      <span>🎉 You win!!!</span>
    </div>
  </div>
</template>

<script>
import confetti from 'canvas-confetti'

var colors = [
  '#ff1744',
  '#f50057',
  '#d500f9',
  '#651fff',
  '#3d5afe',
  '#2979ff',
  '#00b0ff',
  '#00e5ff',
  '#1de9b6',
  '#00e676',
  '#76ff03',
  '#c6ff00',
  '#ffea00',
  '#ffc400',
  '#ff9100',
  '#ff3d00',
]
colors = ['#3d5afe', '#651fff', '#2979ff', '#00b0ff', '#00e5ff']

function showConfetti() {
  var duration = 10 * 1000
  var animationEnd = Date.now() + duration
  var skew = 1
  // use bright colorful colors

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min
  }

  var previousTimestamp
  ;(function frame(time) {
    var count = window.innerWidth / 35
    var averageInterval = 1000

    var chance = count / averageInterval

    let timeLeft = animationEnd - Date.now()

    if (previousTimestamp === undefined && time !== undefined)
      previousTimestamp = time + 0

    let elapsed = time - previousTimestamp

    let rng = Math.random()
    if (rng <= chance * elapsed) {
      var ticks = window.innerHeight * 1.5
      //skew = Math.max(0.8, skew - 0.001);

      confetti({
        particleCount: 1,
        startVelocity: 0,
        origin: {
          x: Math.random(),
          // since particles fall down, skew start toward the top
          y: 0,
        },
        colors: [colors[Math.floor(Math.random() * colors.length)]],
        gravity: randomInRange(0.9, 1.1),
        drift: randomInRange(-0.4, 0.4),
        shapes: ['square', 'square'],
        ticks: ticks,
      })
    }

    previousTimestamp = time + 0

    if (timeLeft > 0) {
      requestAnimationFrame(frame)
    }
  })()
}

function showConfetti2() {
  var count = 100
  var defaults = {
    origin: { y: 0.5 },
  }

  function fire(particleRatio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      })
    )
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: colors,
    shapes: ['square'],
  })
  fire(0.2, {
    spread: 60,
    colors: colors,
    shapes: ['square'],
  })
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: colors,
    shapes: ['square'],
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: colors,
    shapes: ['square'],
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: colors,
    shapes: ['square'],
  })
}

export default {
  data() {
    return {}
  },
  props: ['game', 'me'],
  methods: {
    showConfetti() {
      showConfetti2()
    },
  },
  mounted() {
    showConfetti()
  },
}
</script>