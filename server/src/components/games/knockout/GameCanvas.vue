<!--
  GameCanvas.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { useFacade } from 'components/base-ui/facade'

import {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
  watchEffect,
  toRef,
  toRefs,
  onUnmounted,
} from 'vue'

const {
  game,
  replaying,
  runningAction,
  previousTurn,
  $replayTurn,
  $endReplay,
  $runAction,
  $endAnimation,
} = useFacade()

const canvas = ref()
const fireOrSend = ref(null)
onMounted(() => {
  var ctx = canvas.value.getContext('2d'),
    width,
    height,
    dummyRadius, // (fake radius for rendering)
    dummies = game.value.data.dummies,
    player = game.value.myIndex == -1 ? 1 : game.value.myIndex,
    firing = game.value.data.firing,
    drag = 0.97,
    mouse = { x: 0, y: 0, clicked: false },
    mobile,
    selected,
    iceSize = game.value.data.ice.size,
    animating, 
    collision = (x1, y1, x2, y2) => (x2 - x1) ** 2 + (y2 - y1) ** 2 <= 10 ** 2, padding, actionsToReplay = [];

  function collisionResolution(c1x, c1y, v1x, v1y, c2x, c2y, v2x, v2y) {
    var tangent = {
      x: -(c2x - c1x),
      y: c2y - c1y,
    }
    tLength = (tangent.y ** 2 + tangent.x ** 2) ** 0.5
    tangent.x /= tLength
    tangent.y /= tLength
    relVel = {
      x: v2x - v1x,
      y: v2y - v1y,
    }
    length = relVel.x * tangent.x + relVel.y * tangent.y
    return {
      x: relVel.x - tangent.x * length,
      y: relVel.y - tangent.y * length,
    }
  }

  function fromRelative(lx, ly) {
    // relative to ice
    var x, y
    if (mobile) {
      x =
        width / 2 -
        height / 4 +
        padding +
        ((height / 2 - padding * 2) * lx) / 100
      y = height / 4 + padding + ((height / 2 - padding * 2) * ly) / 100
    } else {
      x = width / 4 + padding + ((width / 2 - padding * 2) * lx) / 100
      y =
        height / 2 -
        width / 4 +
        padding +
        ((width / 2 - padding * 2) * ly) / 100
    }
    return {
      x,
      y,
    }
  }
  function toRelative(lx, ly) {
    // relative to ice
    var x, y
    if (mobile) {
      // (l - p) * 100 / d = x
      x =
        ((lx - (width / 2 - height / 4 + padding)) * 100) /
        (height / 2 - padding * 2)
      y = ((ly - (height / 4 + padding)) * 100) / (height / 2 - padding * 2)
    } else {
      x = ((lx - (width / 4 + padding)) * 100) / (width / 2 - padding * 2)
      y =
        ((ly - (height / 2 - width / 4 + padding)) * 100) /
        (width / 2 - padding * 2)
    }
    return {
      x,
      y,
    }
  }

  function select() {
    for (var i = 0; i < dummies.length; i++) {
      var dum = dummies[i]
      var rel = fromRelative(dum.x, dum.y)
      if ((rel.x - mouse.x) ** 2 + (rel.y - mouse.y) ** 2 <= 20 ** 2 && player != (i / 4 | 0))
        window.selected = i;
    }
  }

  canvas.value.addEventListener('mousemove', (e) => {
    ;(mouse.x = e.offsetX), (mouse.y = e.offsetY)
    if (window.selected != undefined) {
      var dum = dummies[window.selected]
      var rel = toRelative(mouse.x, mouse.y)
      dum.moveDir = { x: rel.x - dum.x, y: rel.y - dum.y }
    }
  })
  canvas.value.addEventListener('touchmove', (e) => {
    ;(mouse.x = e.touches[0].clientX), (mouse.y = e.touches[0].clientY)
    if (window.selected != undefined) {
      var dum = dummies[window.selected]
      var rel = toRelative(mouse.x, mouse.y)
      dum.moveDir = { x: rel.x - dum.x, y: rel.y - dum.y }
    }
  })
  canvas.value.addEventListener('mousedown', (e) => {
    ;(mouse.x = e.offsetX), (mouse.y = e.offsetY), (mouse.clicked = true)
    select()
  })
  canvas.value.addEventListener('touchstart', (e) => {
    ;(mouse.x = e.touches[0].clientX),
      (mouse.y = e.touches[0].clientY),
      (mouse.clicked = true)
    select()
  })

  canvas.value.addEventListener('mouseup', (e) => {
    console.log('eehi')
    ;(mouse.clicked = false), (window.selected = undefined)
  })
  canvas.value.addEventListener('touchend', (e) => {
    ;(mouse.clicked = false), (window.selected = undefined)
  })

  fireOrSend.value.addEventListener('click', e => {
    if (dummies.filter((i) => i.moveDir).length == dummies.length) {
      dummies
        .filter((i) => !i.fallen)
        .forEach((d) => {
          var adjust = width / 32
          d.velocity = { x: d.moveDir.x / adjust, y: d.moveDir.y / adjust }
          d.moveDir = undefined
        });
      animating = true;
    } else {
      //console.log([...dummies]);
      $runAction('setDummies', {dummies});
    }
  });

  $replayTurn(() => {
    for (var action of previousTurn.actions) {
      action
    }
    setTimeout(() => {
    }, 1200)
  })

  function draw() {
    width = window.innerWidth
    height = window.innerHeight

    canvas.value.width = width
    canvas.value.height = height
    ctx.clearRect(0, 0, width, height)
    // drawing the ice is important because the dummies' position will be relative to it
    // so we'll use the ratios of the device to know that position
    // also the ice is square :flushed:
    ctx.fillStyle = 'lightBlue'
    ctx.beginPath()
    mobile = false //height greater
    if (height > width) {
      // width is screen width - padding
      // height is half of screen height
      padding = height / 64
      ctx.fillRect(
        width / 2 - height / 4 + padding,
        height / 4 + padding,
        height / 2 - padding * 2,
        height / 2 - padding * 2
      )
      mobile = true
      dummyRadius = (height / 2 - padding * 2) / 20
    } else {
      padding = width / 64
      ctx.fillRect(
        width / 4 + padding,
        height / 2 - width / 4 + padding,
        width / 2 - padding * 2,
        width / 2 - padding * 2
      )
      dummyRadius = (width / 2 - padding * 2) / 20
    }
    ctx.closePath()

    dummies.forEach((dum, i) => {
      if (!dum.fallen) {
        ctx.beginPath()
        ctx.fillStyle = dum.playerIndex ? 'blue' : 'white'
        var c = fromRelative(dum.x, dum.y)
        ctx.moveTo(c.x, c.y)
        ctx.arc(c.x, c.y, dummyRadius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()
        ctx.beginPath()
        ctx.strokeText(i, c.x, c.y)
        ctx.closePath()
        ctx.beginPath()
        if (dum.moveDir) {
          var mov = fromRelative(dum.x + dum.moveDir.x, dum.y + dum.moveDir.y)
          ctx.moveTo(c.x, c.y)
          ctx.lineTo(mov.x, mov.y)
          ctx.strokeStyle = dum.playerIndex ? 'blue' : 'white'
          ctx.lineWidth = width / 128
          ctx.stroke()
        }
        ctx.closePath()
        dummies
          .filter((i) => !i.fallen)
          .forEach((other, j) => {
            if (
              collision(
                other.x,
                other.y,
                dum.x + dum.velocity.x,
                dum.y + dum.velocity.y
              ) &&
              dum != other
            ) {
              var resolve = collisionResolution(
                dum.x,
                dum.y,
                dum.velocity.x,
                dum.velocity.y,
                other.x,
                other.y,
                other.velocity.x,
                other.velocity.y
              )
              dum.velocity.x = resolve.x
              dum.velocity.y = resolve.y
              other.velocity.x = -resolve.x
              other.velocity.y = -resolve.y
            }
          })
        dum.x += dum.velocity.x
        dum.y += dum.velocity.y
        dum.velocity.x *= drag
        dum.velocity.y *= drag
      }
      if (dum.x < 0 || dum.x > 100 || dum.y > 100 || dum.y < 0)
        dum.fallen = true
    });
    //console.log(mouse)

    if (animating && dummies.filter(i => i.velocity.x < 0.05 && i.velocity.y < 0.05).length == 8) {
      $runAction('setDummies', dummies);
      animating = false;
    }

    requestAnimationFrame(draw)
  }
  draw()
})
</script>

<template>
  <canvas ref="canvas"></canvas>
  <button ref="fireOrSend">send</button>
</template>

<style scoped>
button {
  position:absolute;
  bottom:10vh;

}
</style>