<!--
  GameCanvas.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { useFacade } from 'components/base-ui/facade';

import { onMounted, ref } from 'vue';

import {
  fromRelative,
  toRelative,
  collisionResolution,
} from '@app/js/games/knockout/utils';
import { drawMoveDirection } from '@app/js/games/knockout/canvas';

const {
  game,
  replaying,
  runningAction,
  previousTurn,
  $replayTurn,
  $endReplay,
  $runAction,
  $endAnimation,
} = useFacade();

const canvas = ref();
const fireOrSend = ref(null);
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
    collision = (x1, y1, x2, y2) => (x2 - x1) ** 2 + (y2 - y1) ** 2 <= 10 ** 2,
    padding,
    actionsToReplay = [];

  let scale = window.devicePixelRatio;

  let blackPenguin = new Image();
  blackPenguin.src = '/assets/knockout/blackpenguin.svg';
  let blackPenguinLoaded;
  blackPenguin.onload = () => (blackPenguinLoaded = true);

  let bluePenguin = new Image();
  bluePenguin.src = '/assets/knockout/bluepenguin.svg';
  let bluePenguinLoaded;
  bluePenguin.onload = () => (bluePenguinLoaded = true);

  let ice = new Image();
  ice.src = '/assets/knockout/ice.svg';
  let iceLoaded;
  ice.onload = () => (iceLoaded = true);

  function select() {
    for (var i = 0; i < dummies.length; i++) {
      var dum = dummies[i];
      var rel = fromRelative(dum.x, dum.y, mobile, width, height, padding);
      if (
        (rel.x - mouse.x) ** 2 + (rel.y - mouse.y) ** 2 <= 20 ** 2 &&
        player != ((i / 4) | 0)
      ) {
        window.selected = i;
        console.log('selected', i);
      }
    }
  }

  const pointerMove = (e) => {
    let { offsetX, offsetY } = e.touches?.[0] || e;
    mouse.x = offsetX * scale;
    mouse.y = offsetY * scale;
    if (window.selected != undefined) {
      var dum = dummies[window.selected];
      var rel = toRelative(mouse.x, mouse.y, mobile, width, height, padding);
      let dx = rel.x - dum.x;
      let dy = rel.y - dum.y;
      const d = Math.sqrt(dx ** 2 + dy ** 2);

      if (Math.abs(d) > dummyRadius / 5 / scale) dum.moveDir = { x: dx, y: dy };
      console.log(d, dummyRadius, dum.x, dum.y);
    }
  };

  canvas.value.addEventListener('mousemove', pointerMove);
  canvas.value.addEventListener('touchmove', pointerMove);

  const pointerDown = (e) => {
    let { offsetX, offsetY } = e.touches?.[0] || e;
    mouse.x = offsetX * scale;
    mouse.y = offsetY * scale;
    mouse.clicked = true;
    select();
  };

  canvas.value.addEventListener('mousedown', pointerDown);
  canvas.value.addEventListener('touchstart', pointerDown);

  const pointerUp = (_e) => {
    console.log('eehi');
    mouse.clicked = false;
    window.selected = undefined;
  };

  canvas.value.addEventListener('mouseup', pointerUp);
  canvas.value.addEventListener('touchend', pointerUp);

  fireOrSend.value.addEventListener('click', (e) => {
    if (dummies.filter((i) => i.moveDir).length == dummies.length) {
      dummies
        .filter((i) => !i.fallen)
        .forEach((d) => {
          var adjust = width / 32;
          d.velocity = { x: d.moveDir.x / adjust, y: d.moveDir.y / adjust };
          d.moveDir = undefined;
        });
      animating = true;
    } else {
      //console.log([...dummies]);
      $runAction('setDummies', { dummies });
    }
  });

  function draw() {
    width = window.innerWidth * scale;
    height = window.innerHeight * scale;

    canvas.value.width = width;
    canvas.value.height = height;
    canvas.value.style.width = width / scale + 'px';
    canvas.value.style.height = height / scale + 'px';
    ctx.clearRect(0, 0, width, height);

    // drawing the ice is important because the dummies' position will be relative to it
    // so we'll use the ratios of the device to know that position
    // also the ice is square 😳
    ctx.fillStyle = 'lightBlue';

    ctx.beginPath();

    // Get screen orientation
    mobile = false; //height greater
    if (height > width) {
      // width is screen width - padding
      // height is half of screen height
      padding = height / 64;
      if (iceLoaded) {
        ctx.drawImage(
          ice,
          width / 2 - height / 4 + padding,
          height / 4 + padding,
          height / 2 - padding * 2,
          height / 2 - padding * 2
        );
      }
      mobile = true;
      dummyRadius = (((height / 2 - padding * 2) / 20) * 100) / 85;
    } else {
      padding = width / 64;
      ctx.drawImage(
        ice,
        width / 4 + padding,
        height / 2 - width / 4 + padding,
        width / 2 - padding * 2,
        width / 2 - padding * 2
      );
      dummyRadius = (((width / 2 - padding * 2) / 20) * 100) / 85;
    }
    ctx.closePath();

    // Draw dummies
    dummies.forEach((dum, i) => {
      if (!dum.fallen) {
        ctx.beginPath();
        ctx.fillStyle = dum.playerIndex ? 'blue' : 'white';

        ctx.save();
        // Draw penguin body
        var c = fromRelative(dum.x, dum.y, mobile, width, height, padding);
        ctx.translate(c.x, c.y);
        ctx.rotate(dum.faceDir);
        // ctx.arc(c.x, c.y, dummyRadius, 0, 2 * Math.PI);
        if (dum.playerIndex === 0 && blackPenguinLoaded) {
          ctx.drawImage(
            blackPenguin,
            -dummyRadius,
            -dummyRadius,
            dummyRadius * 2,
            dummyRadius * 2
          );
        } else if (dum.playerIndex === 1 && bluePenguinLoaded) {
          ctx.drawImage(
            bluePenguin,
            -dummyRadius,
            -dummyRadius,
            dummyRadius * 2,
            dummyRadius * 2
          );
        }
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        // Label the penguin with its ID
        ctx.beginPath();
        ctx.strokeText(i, c.x, c.y);
        ctx.closePath();

        // Run physics
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
              );
              dum.velocity.x = resolve.x;
              dum.velocity.y = resolve.y;
              other.velocity.x = -resolve.x;
              other.velocity.y = -resolve.y;
            }
          });
        dum.x += dum.velocity.x;
        dum.y += dum.velocity.y;
        dum.velocity.x *= drag;
        dum.velocity.y *= drag;
      }

      // Check if out of bounds
      if (dum.x < 0 || dum.x > 100 || dum.y > 100 || dum.y < 0)
        dum.fallen = true;
    });
    //console.log(mouse)

    dummies.forEach((dum, i) => {
      if (dum.moveDir && !dum.fallen) {
        // Draw the move direction
        drawMoveDirection(
          ctx,
          dum,
          mobile,
          width,
          height,
          padding,
          dummyRadius
        );
      }
    });

    if (
      animating &&
      dummies.filter((i) => i.velocity.x < 0.05 && i.velocity.y < 0.05)
        .length == 8
    ) {
      $runAction('setDummies', dummies);
      animating = false;
    }

    requestAnimationFrame(draw);
  }
  draw();
});
</script>

<template>
  <canvas ref="canvas"></canvas>
  <button ref="fireOrSend">send</button>
</template>

<style scoped>
button {
  position: absolute;
  bottom: 10vh;
}
</style>
