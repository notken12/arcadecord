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
  collision,
} from '@app/js/games/knockout/utils';
import { drawMoveDirection, getHeadLen } from '@app/js/games/knockout/canvas';
import { replayAction, utils } from '@app/js/client-framework';
import gsap from 'gsap';

import { useFacade } from 'components/base-ui/facade';
import { useAspectRatio } from '@app/components/base-ui/aspectRatio';

import Common from '/gamecommons/knockout';

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
// Ice size (width and height): 100
// Dummy radius: 5

const { REL_DUM_RADIUS, REL_ICE_SIZE, DUM_LEDGE_TOLERANCE } = Common;

let dummyRadius,
  width,
  height,
  fullWidth,
  fullHeight,
  containerX,
  containerY,
  ctx,
  drag = 0.972,
  mouse = { x: 0, y: 0, clicked: false },
  mobile,
  selected,
  simulationRunning,
  padding,
  actionsToReplay = [],
  replayingAction = false,
  showAllMoveDirs = false, // show move dirs before starting simulation
  selectedDum;

const canvas = ref(null);
const fireOrSend = ref(null);
const canvasContainer = ref(null);

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
      fallPercent: 0,
      falling: false,
    });
  }
};

const getCanFireOrSend = () => {
  if (replayingVal) return false;
  if (dummies.find((d) => !d.moveDir && d.playerIndex === player && !d.fallen))
    return false;
  return true;
};

const canFireOrSend = ref(false);

let replayingVal;
watchEffect(() => {
  replayingVal = replaying.value;
});

watch(replaying, (val) => {
  // If the replay is skipped, we need to reset the simulation
  if (!val) {
    actionsToReplay = [];
    endSimulation(true);
    iceSize.value = iceSizeRef.value;
    return;
  }
});

const dummiesRef = computed(() => game.value.data.dummies);
let dummies;
watchEffect(() => {
  dummies = cloneDeep(dummiesRef.value);
  updateDummies();
});

const iceSizeRef = computed(() => game.value.data.ice.size);
const iceSize = {
  value: 100,
};
let iceSizeSet = false;
watchEffect(() => {
  if (iceSizeSet) {
    gsap.to(iceSize, {
      value: iceSizeRef.value,
      duration: ICE_SHRINK_DURATION,
    });
  } else {
    iceSize.value = iceSizeRef.value;
  }
  iceSizeSet = true;
});

const firingRef = computed(() => game.value.data.firing);
let firing;
watchEffect(() => (firing = firingRef.value));

const playerRef = computed(() =>
  game.value.myIndex === -1 ? 1 : game.value.myIndex
);
let player;
watchEffect(() => (player = playerRef.value));

const RESTITUTION = 0.6;

const MAX_LAUNCH_POWER = 40;
let arrowTips = [];

const SIMULATION_DELAY = 1.5; // seconds
const DIRS_FADE_OUT_DURATION = 0.3; // seconds
const DIRS_FADE_OUT_DELAY = 1.3; // seconds
const DUMMY_ROTATE_DURATION = 0.5; // seconds
const DUMMY_FALL_DURATION = 0.4; // seconds
const SPLASH_EFFECT_SIZE = 1;
const ICE_SHRINK_DURATION = 1; // seconds

const style = {
  moveDirOpacity: 1,
};

const cursor = ref('auto');

/** Send the penguins flying */
const startSimulation = () => {
  dummies
    .filter((i) => !i.fallen)
    .forEach((d) => {
      var mult = 0.05; // Multiplier to the speed
      d.velocity = { x: d.moveDir.x * mult, y: d.moveDir.y * mult };
    });
  simulationRunning = true;
};

/** Cleanup after simulation, run the action */
const endSimulation = async (replayEnding) => {
  simulationRunning = false;
  if (!replayEnding) {
    if (!replayingVal) {
      setDummiesFire();
    } else {
      // Replay the action
      let a = actionsToReplay.shift();
      replayAction(game.value, a);

      if (actionsToReplay.length === 0) {
        replayingAction = false;
        if (!a.data.firing) $endReplay(0);
        else $endReplay(ICE_SHRINK_DURATION * 1000);
      } else {
        await utils.wait(ICE_SHRINK_DURATION * 1000);
      }
    }
  }

  replayingAction = false;
  style.moveDirOpacity = 1;
  showAllMoveDirs = false;
  canFireOrSend.value = getCanFireOrSend();
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
      duration: DUMMY_ROTATE_DURATION,
    });
  }

  // Start simulation
  setTimeout(() => {
    startSimulation();
  }, SIMULATION_DELAY * 1000);

  // Fade out move directions
  setTimeout(() => {
    gsap.to(style, {
      moveDirOpacity: 0,
      duration: DIRS_FADE_OUT_DURATION,
    });
  }, DIRS_FADE_OUT_DELAY * 1000);
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
    // if (a.data.firing) {
    //   $endAnimation(ICE_SHRINK_DURATION * 1000);
    // }
    replayAction(game.value, a);

    replayingAction = false;
    if (actionsToReplay.length === 0) {
      if (!a.data.firing) $endReplay(0);
      else $endReplay(ICE_SHRINK_DURATION * 1000);
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
      moveDir: dummy.moveDir ?? null,
      playerIndex: dummy.playerIndex,
      x: dummy.x,
      y: dummy.y,
    };
  }
  if (firing) {
    $endAnimation(ICE_SHRINK_DURATION * 1000);
  }
  $runAction('setDummies', { dummies: states, firing });
};

const fireOrSendFn = () => {
  if (replayingVal) return;
  // Your own move directions must be set
  if (!getCanFireOrSend()) return;

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

const resize = () => {
  let scale = window.devicePixelRatio;

  const container = canvas.value.parentElement;
  const size = Math.min(container.offsetWidth, container.offsetHeight);
  width = size * scale;
  height = size * scale;
  fullWidth = window.innerWidth * scale;
  fullHeight = window.innerHeight * scale;

  canvas.value.width = fullWidth;
  canvas.value.height = fullHeight;
  canvas.value.style.width = fullWidth / scale + 'px';
  canvas.value.style.height = fullHeight / scale + 'px';

  // Get screen orientation
  padding = width * 0.1;
  dummyRadius = ((width - padding * 2) * REL_DUM_RADIUS) / REL_ICE_SIZE;

  const cbbox = container.getBoundingClientRect();
  containerX = cbbox.x;
  containerY = cbbox.y;

  console.log('resize');
};

useAspectRatio(1, canvasContainer, resize);

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

      const { d } = distanceToMouse(dum);

      if (d <= REL_DUM_RADIUS && player != ((i / 4) | 0)) {
        selectedDum = i;
        return;
      }
    }
    for (let i = 0; i < arrowTips.length; i++) {
      let tip = arrowTips[i];
      if (!tip) continue;
      const rel = fromRelative(
        tip.x,
        tip.y,
        mobile,
        width,
        height,
        padding,
        iceSize.value
      );
      rel.x += containerX * scale;
      rel.y += containerY * scale;
      let dx = rel.x - mouse.x;
      let dy = rel.y - mouse.y;
      let d = Math.sqrt(dx ** 2 + dy ** 2);
      if (d < getHeadLen(dummyRadius) * 1.5) {
        selectedDum = i;
        return;
      }
    }
  }

  const distanceToMouse = (dum) => {
    // Get relative distances
    var rel = toRelative(
      mouse.x - containerX * scale,
      mouse.y - containerY * scale,
      mobile,
      width,
      height,
      padding,
      iceSize.value
    );
    let dx = rel.x - dum.x;
    let dy = rel.y - dum.y;
    const d = Math.sqrt(dx ** 2 + dy ** 2);
    return { d, dx, dy };
  };

  const pointerMove = (e) => {
    if (replayingVal || simulationRunning || showAllMoveDirs) return;
    let { clientX, clientY } = screenToCanvasPos(e.touches?.[0] || e);
    mouse.x = clientX * scale;
    mouse.y = clientY * scale;
    if (selectedDum !== undefined) {
      var dum = dummies[selectedDum];
      let { d, dx, dy } = distanceToMouse(dum);

      if (d <= REL_DUM_RADIUS) {
        dum.moveDir = null;
      } else {
        if (d > MAX_LAUNCH_POWER) {
          let angle = Math.atan2(dy, dx);
          // Restrict to maximum
          let cos = Math.cos(angle);
          let sin = Math.sin(angle);
          dx = MAX_LAUNCH_POWER * cos;
          dy = MAX_LAUNCH_POWER * sin;
        }

        dum.moveDir = { x: dx, y: dy };
        cursor.value = 'grabbing';
      }

      canFireOrSend.value = getCanFireOrSend();
    } else {
      // Set the cursor to pointer if the user is hovering over a penguin they can move
      for (let dum of dummies) {
        if (dum.playerIndex !== player) continue;
        const { d } = distanceToMouse(dum);
        if (d <= REL_DUM_RADIUS) {
          cursor.value = 'grab';
          return;
        }
      }
    }
    for (let i = 0; i < arrowTips.length; i++) {
      let tip = arrowTips[i];
      if (!tip) continue;
      const rel = fromRelative(
        tip.x,
        tip.y,
        mobile,
        width,
        height,
        padding,
        iceSize.value
      );
      rel.x += containerX * scale;
      rel.y += containerY * scale;
      let dx = rel.x - mouse.x;
      let dy = rel.y - mouse.y;
      let d = Math.sqrt(dx ** 2 + dy ** 2);
      if (d < getHeadLen(dummyRadius) * 1.5) {
        cursor.value = 'grab';
        return;
      }
    }
    window.dummies = dummies;
    cursor.value = 'auto';
  };

  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('touchmove', pointerMove);

  const pointerDown = (e) => {
    if (replayingVal || simulationRunning || showAllMoveDirs) return;
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
    selectedDum = undefined;
  };

  canvas.value.addEventListener('mouseup', pointerUp);
  canvas.value.addEventListener('touchend', pointerUp);

  function draw() {
    ctx.clearRect(0, 0, fullWidth, fullHeight);

    ctx.translate(containerX * scale, containerY * scale);
    // drawing the ice is important because the dummies' position will be relative to it
    // so we'll use the ratios of the device to know that position
    // also the ice is square 😳

    ctx.beginPath();

    // Get screen orientation
    if (iceLoaded) {
      let size = ((width - padding * 2) * iceSize.value) / 100;
      ctx.drawImage(
        ice,
        width / 2 - size / 2,
        width / 2 - size / 2,
        size,
        size
      );
    }
    ctx.closePath();

    // Draw dummies
    dummies.forEach((dum, i) => {
      if (!dum.fallen) {
        ctx.save();
        // Draw penguin body
        var c = fromRelative(
          dum.x,
          dum.y,
          mobile,
          width,
          height,
          padding,
          iceSize.value
        );
        ctx.translate(c.x, c.y);
        ctx.rotate(dum.faceDir - Math.PI / 2);
        // ctx.arc(c.x, c.y, dummyRadius, 0, 2 * Math.PI);
        ctx.shadowColor = 'black';
        ctx.shadowBlur = dummyRadius * 0.3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        let displayRadius = dummyRadius;
        if (dum.fallPercent !== null && dum.fallPercent !== undefined) {
          displayRadius *= (100 - dum.fallPercent) / 100;
        }

        let x = -displayRadius;
        let y = -displayRadius;
        let w = displayRadius * 2;
        let h = displayRadius * 2;

        ctx.globalAlpha = 1 - dum.fallPercent / 100;

        // Show pulsing effect on your penguins that you still need to position
        if (
          !simulationRunning &&
          !dum.moveDir &&
          !dum.falling &&
          dum.playerIndex === player &&
          !replayingVal
        ) {
          let d = performance.now() % 1000;
          if (d > 500) {
            d = 1000 - d;
          }
          d /= 500;

          let intensity = 0.4;
          ctx.globalAlpha = d * intensity + 1 - intensity;
        }

        if (dum.playerIndex === 0 && blackPenguinLoaded) {
          ctx.drawImage(blackPenguin, x, y, w, h);
        } else if (dum.playerIndex === 1 && bluePenguinLoaded) {
          ctx.drawImage(bluePenguin, x, y, w, h);
        }

        if (dum.falling) {
          // Draw a circle to show the splash
          let splashRadius =
            dummyRadius * (1 + (dum.fallPercent / 100) * SPLASH_EFFECT_SIZE);

          let x = -splashRadius;
          let y = -splashRadius;

          ctx.strokeStyle = '#e5eeff';
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.arc(0, 0, splashRadius, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.restore();

        // // Label the penguin with its ID
        // ctx.beginPath();
        // ctx.strokeText(i, c.x, c.y);
        // ctx.closePath();

        if (simulationRunning) {
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
                dum.y + dum.velocity.y,
                REL_DUM_RADIUS,
                iceSize.value
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
              dum.velocity.x = resolve.x * RESTITUTION;
              dum.velocity.y = resolve.y * RESTITUTION;
              other.velocity.x = -resolve.x * RESTITUTION;
              other.velocity.y = -resolve.y * RESTITUTION;
            }
          }
        }

        dum.x += dum.velocity.x;
        dum.y += dum.velocity.y;
        dum.velocity.x *= drag;
        dum.velocity.y *= drag;

        if (dum.falling) {
          dum.velocity.x *= 0.85;
          dum.velocity.y *= 0.85;
        }
      }

      // Check if out of bounds
      if (
        !dum.fallen &&
        !dum.falling &&
        (dum.x <= -REL_DUM_RADIUS * DUM_LEDGE_TOLERANCE ||
          dum.x >= REL_ICE_SIZE + REL_DUM_RADIUS * DUM_LEDGE_TOLERANCE ||
          dum.y >= REL_ICE_SIZE + REL_DUM_RADIUS * DUM_LEDGE_TOLERANCE ||
          dum.y <= -REL_DUM_RADIUS * DUM_LEDGE_TOLERANCE)
      ) {
        dum.falling = true;
        // dum.velocity = { x: 0, y: 0 }
        // Animate dummy falling
        gsap.fromTo(
          dum,
          {
            fallPercent: 0,
          },
          {
            fallPercent: 100,
            duration: DUMMY_FALL_DURATION,
            ease: 'power1.in',
            onComplete() {
              dum.fallen = true;
              dum.falling = false;
            },
          }
        );
      }
    });

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
          style.moveDirOpacity,
          iceSize.value
        );
        arrowTips[i] = tip;
      }
    });

    if (
      simulationRunning &&
      dummies.filter(
        (i) => i.velocity.x < 0.03 && i.velocity.y < 0.03 && !i.falling
      ).length == 8
    ) {
      endSimulation();
    }

    if (!simulationRunning && actionsToReplay.length > 0 && !replayingAction) {
      replayingAction = true;
      replayNextAction();
    }

    // Reset current transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    requestAnimationFrame(draw);
  }

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
  <div class="canvas-container-wrapper">
    <div ref="canvasContainer">
      <canvas ref="canvas" :style="{ cursor }"></canvas>
    </div>
  </div>
  <button
    ref="fireOrSend"
    @click="fireOrSendFn"
    v-if="canFireOrSend"
  >
    Send
  </button>
</template>

<style scoped>
.canvas-container-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

button {
  margin-bottom: 32px;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.shown {
  opacity: 1;
  pointer-events: auto;
}
</style>
