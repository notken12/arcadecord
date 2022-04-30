<!--
  GameCanvas.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
import { onMounted, ref, computed, watchEffect, watch, onUnmounted } from 'vue';

import cloneDeep from 'lodash.clonedeep';

import {
  fromRelative,
  toRelative,
  collisionResolution,
} from '@app/js/games/knockout/utils';
import { drawMoveDirection, getHeadLen } from '@app/js/games/knockout/canvas';
import { replayAction } from '@app/js/client-framework';
import gsap from 'gsap';

import { useFacade } from 'components/base-ui/facade';

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

// Relative coordinate system:
// Ice width: 100
// Dummy radius: 5

let dummyRadius,
  width,
  height,
  ctx,
  drag = 0.97,
  mouse = { x: 0, y: 0, clicked: false },
  mobile,
  selected,
  simulationRunning,
  padding,
  actionsToReplay = [],
  replayingAction = false,
  showAllMoveDirs = false; // show move dirs before starting simulation

const canvas = ref();
const fireOrSend = ref(null);

const updateDummies = () => {
  for (let i = 0; i < game.value.data.dummies.length; i++) {
    let dum = dummies[i];
    let ndum = game.value.data.dummies[i];
    Object.assign(dum, {
      fallen: ndum.fallen,
      x: ndum.x,
      y: ndum.y,
      faceDir: ndum.faceDir,
      velocity: ndum.velocity,
    });
  }
};

let replayingVal;
watchEffect(() => {
  replayingVal = replaying.value;
});

watch(replaying, (val) => {
  // If the replay is skipped, we need to reset the simulation
  if (!val) {
    actionsToReplay = [];
    endSimulation(true);
    return;
  }
});

const dummiesRef = computed(() => game.value.data.dummies);
let dummies;
watchEffect(() => {
  dummies = dummiesRef.value;
  updateDummies();
});

const iceSizeRef = computed(() => game.value.data.ice.size);
let iceSize;
watchEffect(() => (iceSize = iceSizeRef.value));

const firingRef = computed(() => game.value.data.firing);
let firing;
watchEffect(() => (firing = firingRef.value));

const playerRef = computed(() =>
  game.value.myIndex === -1 ? 1 : game.value.myIndex
);
let player;
watchEffect(() => (player = playerRef.value));

const collision = (x1, y1, x2, y2) =>
  (x2 - x1) ** 2 + (y2 - y1) ** 2 <= 10 ** 2;

const restitution = 0.6;

const maxLaunchPower = 40;
let arrowTips = [];

const simulationDelay = 1.5; // seconds
const dirsFadeOutDuration = 0.3; // seconds
const dirsFadeOutDelay = 1.3; // seconds
const dummyRotateDuration = 0.5; // seconds

const style = {
  moveDirOpacity: 1,
};

/** Send the penguins flying */
const startSimulation = () => {
  dummies
    .filter((i) => !i.fallen)
    .forEach((d) => {
      var mult = 0.05; // Multiplier to the speed
      d.velocity = { x: d.moveDir.x * mult, y: d.moveDir.y * mult };
      // d.velocity = { x: d.moveDir.x, y: d.moveDir.y };
    });
  simulationRunning = true;
};

/** Cleanup after simulation, run the action */
const endSimulation = (replayEnding) => {
  if (!replayEnding) {
    if (!replayingVal) {
      setDummiesFire();
    } else {
      // Replay the action
      let a = actionsToReplay.shift();
      replayAction(game.value, a);

      replayingAction = false;

      if (actionsToReplay.length === 0) {
        $endReplay(0);
      }
    }
  }

  simulationRunning = false;
  replayingAction = false;
  style.moveDirOpacity = 1;
  showAllMoveDirs = false;
};

const showMoveDirsAndStartSimulation = () => {
  // Show all move directions
  style.moveDirOpacity = 1;
  showAllMoveDirs = true;

  // Rotate penguins faceDirs toward their moveDirs
  for (let dum of dummies) {
    if (!dum.moveDir) continue;
    let angle = Math.atan2(dum.moveDir.y, dum.moveDir.x);
    gsap.to(dum, {
      faceDir: angle,
      duration: dummyRotateDuration,
    });
  }

  // Start simulation
  setTimeout(() => {
    startSimulation();
  }, simulationDelay * 1000);

  // Fade out move directions
  setTimeout(() => {
    gsap.to(style, {
      moveDirOpacity: 0,
      duration: dirsFadeOutDuration,
    });
  }, dirsFadeOutDelay * 1000);
};

const replayNextAction = () => {
  let action = actionsToReplay[0];
  if (!action) return;

  if (action.data.firing) {
    replayingAction = true;
    // Apply move directions to dummies
    for (let i = 0; i < action.data.dummies.length; i++) {
      let ndum = action.data.dummies[i];
      dummies[i].moveDir = ndum.moveDir;
    }
    // Show the players the directions, then start the simulation
    showMoveDirsAndStartSimulation();
  } else {
    // Else let the updateDummies do its thing
    let a = actionsToReplay.shift();
    replayAction(game.value, a);

    replayingAction = false;
    if (actionsToReplay.length === 0) {
      $endReplay(0);
    }
  }
};

const setDummiesFire = () => {
  let states = [];
  for (let i = 0; i < dummies.length; i++) {
    let dummy = dummies[i];
    states[i] = {
      faceDir: dummy.faceDir,
      fallen: dummy.fallen,
      moveDir: dummy.moveDir,
      playerIndex: dummy.playerIndex,
      x: dummy.x,
      y: dummy.y,
    };
  }
  $runAction('setDummies', { dummies: states, firing });
};

const fireOrSendFn = () => {
  if (replayingVal) return;
  // Your own move directions must be set
  if (dummies.find((d) => !d.moveDir && d.playerIndex === player && !d.fallen))
    return;

  if (firing) {
    showMoveDirsAndStartSimulation();
  } else {
    setDummiesFire();
  }
};

const screenToCanvasPos = ({ clientX, clientY }) => {
  let cbbox = canvas.value.getBoundingClientRect();
  return {
    clientX: clientX - cbbox.x,
    clientY: clientY - cbbox.y,
  };
};

onMounted(() => {
  window.dummies = dummies;
  ctx = canvas.value.getContext('2d');

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
      const rel = fromRelative(dum.x, dum.y, mobile, width, height, padding);
      let dx = rel.x - mouse.x;
      let dy = rel.y - mouse.y;
      let d = Math.sqrt(dx ** 2 + dy ** 2);
      if (d <= dummyRadius && player != ((i / 4) | 0)) {
        window.selected = i;
        console.log('selected', i);
        return;
      }
    }
    for (let i = 0; i < arrowTips.length; i++) {
      let tip = arrowTips[i];
      if (!tip) continue;
      const rel = fromRelative(tip.x, tip.y, mobile, width, height, padding);
      let dx = rel.x - mouse.x;
      let dy = rel.y - mouse.y;
      let d = Math.sqrt(dx ** 2 + dy ** 2);
      if (d < getHeadLen(dummyRadius) * 1.5) {
        window.selected = i;
        console.log('selected', i);
        return;
      }
    }
  }

  const pointerMove = (e) => {
    if (replayingVal) return;
    let { clientX, clientY } = screenToCanvasPos(e.touches?.[0] || e);
    mouse.x = clientX * scale;
    mouse.y = clientY * scale;
    if (window.selected != undefined) {
      var dum = dummies[window.selected];

      // Get relative distances
      var rel = toRelative(mouse.x, mouse.y, mobile, width, height, padding);
      let dx = rel.x - dum.x;
      let dy = rel.y - dum.y;
      const d = Math.sqrt(dx ** 2 + dy ** 2);

      if (d <= 5) {
        dum.moveDir = null;
        return;
      }

      // Restrict to maximum
      if (d > maxLaunchPower) {
        let angle = Math.atan2(dy, dx);
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        dx = maxLaunchPower * cos;
        dy = maxLaunchPower * sin;
      }

      dum.moveDir = { x: dx, y: dy };
    }
    window.dummies = dummies;
  };

  canvas.value.addEventListener('mousemove', pointerMove);
  canvas.value.addEventListener('touchmove', pointerMove);

  const pointerDown = (e) => {
    if (replayingVal) return;
    let { clientX, clientY } = screenToCanvasPos(e.touches?.[0] || e);
    mouse.x = clientX * scale;
    mouse.y = clientY * scale;
    mouse.clicked = true;
    select();
  };

  canvas.value.addEventListener('mousedown', pointerDown);
  canvas.value.addEventListener('touchstart', pointerDown);

  const pointerUp = (_e) => {
    if (replayingVal) return;
    mouse.clicked = false;
    window.selected = undefined;
  };

  canvas.value.addEventListener('mouseup', pointerUp);
  canvas.value.addEventListener('touchend', pointerUp);

  const resize = () => {
    const container = canvas.value.parentElement;
    const size = Math.min(container.offsetWidth, container.offsetHeight);
    width = size * scale;
    height = size * scale;

    canvas.value.width = width;
    canvas.value.height = height;
    canvas.value.style.width = width / scale + 'px';
    canvas.value.style.height = height / scale + 'px';

    // Get screen orientation
    padding = size * -0.2;
    dummyRadius = (((size / 2 - padding * 2) / 20) * 100) / 75;
  };

  function draw() {
    // ctx.clearRect(0, 0, width, height);

    ctx.clearRect(0, 0, width, height);

    // drawing the ice is important because the dummies' position will be relative to it
    // so we'll use the ratios of the device to know that position
    // also the ice is square 😳

    ctx.beginPath();

    // Get screen orientation
    if (mobile) {
      // width is screen width - padding
      // height is half of screen height
      if (iceLoaded) {
        ctx.drawImage(
          ice,
          width / 2 - height / 4 + padding,
          height / 4 + padding,
          height / 2 - padding * 2,
          height / 2 - padding * 2
        );
      }
    } else {
      ctx.drawImage(
        ice,
        width / 4 + padding,
        height / 2 - width / 4 + padding,
        width / 2 - padding * 2,
        width / 2 - padding * 2
      );
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
        ctx.rotate(dum.faceDir - Math.PI / 2);
        // ctx.arc(c.x, c.y, dummyRadius, 0, 2 * Math.PI);
        ctx.shadowColor = 'black';
        ctx.shadowBlur = dummyRadius * 0.3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

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
        for (let j = 0; j < dummies.length; j++) {
          let other = dummies[j];
          if (i === j) continue;
          if (other.fallen) continue;
          if (
            collision(
              other.x,
              other.y,
              dum.x + dum.velocity.x,
              dum.y + dum.velocity.y
            )
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
            dum.velocity.x = resolve.x * restitution;
            dum.velocity.y = resolve.y * restitution;
            other.velocity.x = -resolve.x * restitution;
            other.velocity.y = -resolve.y * restitution;
          }
        }

        dum.x += dum.velocity.x;
        dum.y += dum.velocity.y;
        dum.velocity.x *= drag;
        dum.velocity.y *= drag;
      }

      // Check if out of bounds
      if (dum.x < 0 || dum.x > 100 || dum.y > 100 || dum.y < 0) {
        dum.fallen = true;
        dum.velocity = { x: 0, y: 0 };
      }
    });
    //console.log(mouse)

    dummies.forEach((dum, i) => {
      if (dum.moveDir && !dum.fallen) {
        // Don't display if it isn't your penguins
        if (dum.playerIndex !== player && !showAllMoveDirs) return;
        if (replayingVal && !showAllMoveDirs) return;

        // Draw the move direction
        // and return the arrow tip location
        let tip = drawMoveDirection(
          ctx,
          dum,
          mobile,
          width,
          height,
          padding,
          dummyRadius,
          style.moveDirOpacity
        );
        arrowTips[i] = tip;
      }
    });

    if (
      simulationRunning &&
      dummies.filter((i) => i.velocity.x < 0.05 && i.velocity.y < 0.05)
        .length == 8
    ) {
      endSimulation();
    }

    if (!simulationRunning && actionsToReplay.length > 0 && !replayingAction) {
      replayingAction = true;
      replayNextAction();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  window.requestAnimationFrame(draw);

  $replayTurn(() => {
    setTimeout(() => {
      for (let action of previousTurn.value.actions) {
        actionsToReplay.push(action);
      }
    }, 700);
  });
});

onUnmounted(() => {
  location.reload();
});
</script>

<template>
  <div class="canvas-container">
    <canvas ref="canvas"></canvas>
  </div>
  <button ref="fireOrSend" @click="fireOrSendFn">send</button>
</template>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

button {
  margin-bottom: 32px;
}
</style>
