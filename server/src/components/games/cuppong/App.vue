<!--
  App.vue - Arcadecord

  Copyright (C) 2022 Ken Zhou

  This file is part of Arcadecord.

  Arcadecord can not be copied and/or distributed
  without the express permission of Ken Zhou.
-->

<script setup>
// Import Vue components
// game-view, scores-view are automatically imported

// Import scss styles
// import 'scss/games/cuppong.scss'

import { replayAction } from '@app/js/client-framework.js';
import Common from '/gamecommons/cuppong';

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
} from 'vue';

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import gsap from 'gsap';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { useFacade } from 'components/base-ui/facade';

import {
  getCupBody,
  getCupPosition,
  tableLength,
  tableWidth,
} from '@app/js/games/cuppong/Cup';

const {
  game,
  me,
  replaying,
  runningAction,
  $replayTurn,
  $endReplay,
  $runAction,
  $endAnimation,
} = useFacade();

let hint = computed(() => {
  return '';
});

const sides = computed(() => game.value.data.sides);

const mySide = computed(() => {
  let index = game.value.myIndex === -1 ? 1 : game.value.myIndex;
  return game.value.data.sides[index];
});

const otherSide = computed(() => {
  let index = game.value.myIndex === -1 ? 0 : game.value.myIndex === 0 ? 1 : 0;
  return game.value.data.sides[index];
});

const sideCups0 = computed(() => {
  return sides.value[0].cups;
});

const sideCups1 = computed(() => {
  return sides.value[1].cups;
});

const cameraRotation = computed(() => {
  let x = mySide.value.color === 'red' ? -Math.PI / 3.5 : Math.PI / 3.5;
  let y = mySide.value.color === 'red' ? 0 : Math.PI;

  if (replaying.value) {
    // x *= -1
    // y = Math.PI - y
  }
  return {
    x,
    y,
    z: 0,
  };
});

const cameraPosition = computed(() => {
  let x = 0;
  let y = 0.8;
  let z = mySide.value.color === 'red' ? 0.2 : -0.2;
  if (replaying.value) {
    z += mySide.value.color === 'red' ? 1 : -1;
  }
  return {
    x,
    y,
    z,
  };
});

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
});
world.enableSleep = true;
// world.solver = new CANNON.SplitSolver(new CANNON.GSSolver())
world.solver.iterations = 10;
world.solver.tolerance = 0;

const canvasWrapper = ref(null);

let scene,
  camera,
  renderer,
  orbitControls,
  tableObject,
  tableBody,
  ballObject,
  ballBody;

let orbitControlsEnabled = false;
let cannonDebuggerEnabled = false;

const cupObjects = {};
const cupBodies = {};

const canvas = ref(null);

const message = ref('');
const overlayAnimated = ref(false);

function ballsBackWatcher(newValue, oldValue) {
  if (newValue[0] === true || newValue[1] === true) {
    message.value = 'Balls back';
    overlayAnimated.value = true;
  }
}

function inRedemptionWatcher(newValue, oldValue) {
  if (
    (newValue[0] === true || (newValue[1] === true && replaying.value)) &&
    !game.hasEnded
  ) {
    message.value = 'Redemption';
    overlayAnimated.value = true;
  }
}

watch(
  [() => mySide.value.ballsBack, () => otherSide.value.ballsBack],
  ballsBackWatcher,
  { deep: true, flush: 'post' }
);

watch(
  [() => mySide.value.inRedemption, () => otherSide.value.inRedemption],
  inRedemptionWatcher,
  { deep: true, flush: 'post' }
);

function updateCups() {
  for (let i = 0; i < sides.value.length; i++) {
    let side = sides.value[i];
    for (let j = 0; j < side.cups.length; j++) {
      let cup = side.cups[j];
      let cupObject = cupObjects[cup.id];
      let cupBody = cupBodies[cup.id];

      let position = getCupPosition(cup);

      if (cup.out || (cup.color === mySide.value.color && !replaying.value)) {
        cupBody.type = CANNON.Body.STATIC;
        cupBody.isTrigger = true;
        cupBody.sleep();
        gsap.to(cupObject.position, {
          duration: 0.5,
          y: position.y,
          ease: 'power3.inOut',
          onComplete: () => {
            gsap.to(cupObject.position, {
              x: position.x,
              y: position.y,
              z: position.z,
              duration: 0.5,
              ease: 'power3.inOut',
            });
          },
        });
      } else {
        gsap.to(cupObject.position, {
          duration: 0.5,
          x: position.x,
          y: position.y,
          z: position.z,
          ease: 'power3.inOut',
        });
        cupBody.type = CANNON.Body.KINEMATIC;
        cupBody.isTrigger = false;
        cupBody.position = new CANNON.Vec3(position.x, position.y, position.z);
        cupBody.wakeUp();
      }
    }
  }
}

watch(() => game.value.data.sides, updateCups, { deep: true });

watch(() => game.value.turn, updateCups);

watch(() => replaying.value, updateCups);

const fps = ref(0);

function endSimulation(throwForce, knockedCup) {
  simulationStartTime = null;

  velocity.x = 0;
  velocity.y = 0;
  velocity.z = 0;

  ballBody.position.set(0, 0.02, 0);
  ballBody.velocity.set(0, 0, 0);
  ballBody.angularVelocity.set(0, 0, 0);

  if (replaying.value) {
    let action = actionsToReplay.shift();
    replayAction(game.value, action);

    if (actionsToReplay.length === 0) {
      $endReplay(800);
      firstActionReplayed = false;
    } else {
      setTimeout(() => {
        replayNextThrow();
      }, 500);
    }
    return;
  }

  // if (!knockedCup) return // dev cheat

  // Don't run the action if theres no throw force provided
  // This is to allow the simulation to be ended without
  // throwing the ball. Useful for skipping replays.
  if (!throwForce) {
    firstActionReplayed = false;
    return;
  }

  $runAction('throw', {
    force: throwForce,
    knockedCup: knockedCup?.id || undefined,
  });
  $endAnimation(500);
}

function replayNextThrow() {
  let action = actionsToReplay[0];
  if (!action) return;
  let { x, y, z } = action.data.force;
  ballBody.applyForce(new CANNON.Vec3(x, y, z), ballBody.position);
  simulationStartTime = performance.now() / 1000;
}

let firstActionReplayed = false;

const initThree = () => {
  let frames = 0;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc9d4ee);
  camera = new THREE.PerspectiveCamera(
    75,
    canvasWrapper.value.clientWidth / canvasWrapper.value.clientHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(
    canvasWrapper.value.clientWidth,
    canvasWrapper.value.clientHeight
  );

  const cannonDebugger = new CannonDebugger(scene, world, {
    // options...
  });

  if (orbitControlsEnabled) {
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.25;
  }

  function addCups(sideCups, gltf) {
    for (let cup of sideCups) {
      // console.count('addCups')
      let cupObject = gltf.scene.clone();
      let position = getCupPosition(cup);
      cupObject.position.set(position.x, position.y, position.z);
      cupObject.traverse(function (child) {
        if (child.isMesh) {
          child.material.flatShading = false;
          child.castShadow = true;
          // child.receiveShadow = true
        }
      });
      // cupObject.children[1].receiveShadow = true
      // cupObject.castShadow = true
      // cupObject.receiveShadow = true

      scene.add(cupObject);
      cupObjects[cup.id] = cupObject;

      let cupBody = getCupBody(cup);
      if (cup.out || (cup.color === mySide.value.color && !replaying.value)) {
        cupBody.type = CANNON.Body.STATIC;
        cupBody.isTrigger = true;
        cupBody.sleep();
      } else {
        cupBody.type = CANNON.Body.KINEMATIC;
        cupBody.isTrigger = false;
        cupBody.wakeUp();
      }

      world.addBody(cupBody);
      cupBodies[cup.id] = cupBody;
    }
  }

  // load table model
  const loader = new GLTFLoader();
  loader.load('/assets/cuppong/table.glb', (gltf) => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        // child.castShadow = true
        child.receiveShadow = true;
        child.material.map.minFilter = THREE.LinearFilter;

        scene.add(child);

        tableObject = child;
        // tableObject.castShadow = true
        // tableObject.receiveShadow = true

        // add table body
      }
    });
  });

  tableBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(
      new CANNON.Vec3(tableWidth / 2, 0.1, tableLength / 2)
    ),
    position: new CANNON.Vec3(0, 0, 0),
    material: new CANNON.Material({
      friction: 0.5,
      restitution: 0.9,
    }),
    type: CANNON.Body.STATIC,
  });
  tableBody.position.set(0, -0.1, 0);
  world.addBody(tableBody);

  // load cup model
  loader.load('/assets/cuppong/red_cup.glb', (gltf) => {
    addCups(sideCups0.value, gltf);
  });

  loader.load('/assets/cuppong/blue_cup.glb', (gltf) => {
    let sideCups = toRefs(game.value.data.sides[1].cups);
    addCups(sideCups1.value, gltf);
  });

  // add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  // add point light
  // const pointLight = new THREE.PointLight(0xffffff, 0.5);
  // pointLight.position.set(0, 0.4, 0);
  // pointLight.castShadow = true
  // //Set up shadow properties for the light
  // pointLight.shadow.mapSize.width = 1024 // default
  // pointLight.shadow.mapSize.height = 1024 // default
  // pointLight.shadow.camera.near = 0.1 // default
  // pointLight.shadow.camera.far = 2.2 // default
  // pointLight.shadow.radius = 1
  // scene.add(pointLight)

  // const spotLight = new THREE.SpotLight(0xffffff);
  // spotLight.position.set(0.3, 0.75, 0);
  // spotLight.lookAt(new THREE.Vector3(0, 0, 0));
  // spotLight.castShadow = true

  // spotLight.shadow.mapSize.width = 1024
  // spotLight.shadow.mapSize.height = 1024

  // spotLight.shadow.camera.near = 0.1
  // spotLight.shadow.camera.far = 5
  // spotLight.shadow.camera.fov = 30

  // scene.add(spotLight)

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
  directionalLight1.position.set(0.6, 0.4, 0);
  directionalLight1.castShadow = true;

  scene.add(directionalLight1);
  scene.add(directionalLight1.target);
  directionalLight1.target.position.set(0, -0.2, 0);

  directionalLight1.shadow.camera.top = 0.43;
  directionalLight1.shadow.camera.bottom = -0.15;
  directionalLight1.shadow.camera.left = -1.0;
  directionalLight1.shadow.camera.right = 1.0;
  directionalLight1.shadow.camera.near = 0.2;
  directionalLight1.shadow.camera.far = 1.0;
  directionalLight1.shadow.mapSize.width = 1024;
  directionalLight1.shadow.mapSize.height = 256;

  // const directionalLight2 = directionalLight1.clone();
  // directionalLight2.position.set(0.4, 0.4, -0.8);
  //
  // directionalLight1.castShadow = true;

  // scene.add(directionalLight2);
  // scene.add(directionalLight2.target);
  // directionalLight2.target.position.set(0, 0, -0.8);

  if (orbitControlsEnabled) {
    scene.add(new THREE.CameraHelper(directionalLight1.shadow.camera));
    // scene.add(new THREE.CameraHelper(directionalLight2.shadow.camera));
  }

  // const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.1);
  // scene.add(pointLightHelper)

  // const helper = new THREE.CameraHelper(pointLight.shadow.camera);
  // scene.add(helper);

  // add ball
  ballObject = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 16, 16),
    new THREE.MeshPhongMaterial({
      specular: 0xffffff,
      shininess: 0,
      reflectivity: 0,
      combine: THREE.AddOperation,
      flatShading: false,
      color: 0xe87902,
    })
  );

  ballObject.castShadow = true;
  ballObject.receiveShadow = true;

  ballObject.position.setY(0.02);
  scene.add(ballObject);

  ballBody = new CANNON.Body({
    mass: 0.0027, // kg
    type: CANNON.Body.DYNAMIC,
    shape: new CANNON.Sphere(0.02),
    material: new CANNON.Material({
      friction: 0.5,
      restitution: 0.9,
    }),
  });

  ballBody.position.set(
    ballObject.position.x,
    ballObject.position.y,
    ballObject.position.z
  );
  ballBody.quaternion.set(
    ballObject.quaternion.x,
    ballObject.quaternion.y,
    ballObject.quaternion.z,
    ballObject.quaternion.w
  );
  ballBody.linearDamping = 0.4;
  ballBody.allowSleep = true;

  ballBody.sleepSpeedLimit = 0.5; // Body will feel sleepy if speed< 0.05 (speed == norm of velocity)
  ballBody.sleepTimeLimit = 0.1; // Body falls asleep after 1s of sleepiness

  world.addBody(ballBody);

  const simulationDuration = 3; // seconds

  const timeStep = 1 / 60; // seconds
  let lastCallTime;
  function animate() {
    requestAnimationFrame(animate);
    frames++;

    let dt = 0;

    const time = performance.now() / 1000; // seconds
    // if (!lastCallTime) {
    //   world.step(timeStep)
    //   lastCallTime = time
    // } else {
    //   dt = time - lastCallTime
    //   if (dt >= timeStep) {
    //     lastCallTime = time
    //     world.step(timeStep)
    //   }
    // }
    world.fixedStep();

    // Step Cannon World
    if (tableBody && ballBody) {
      world.fixedStep();
      // tableObject.position.copy(tableBody.position)
      // tableObject.quaternion.copy(tableBody.quaternion)

      if (simulationStartTime === null) {
        if (actionsToReplay.length > 0 && !firstActionReplayed) {
          // Replay action of first throw
          replayNextThrow();
          firstActionReplayed = true;
        }
      }
    }

    if (orbitControls) orbitControls.update();

    if (cannonDebuggerEnabled) cannonDebugger.update(); // Update the CannonDebugger meshes

    // Render THREE.js
    renderer.render(scene, camera);

    ballObject.position.copy(ballBody.position);
    ballObject.quaternion.copy(ballBody.quaternion);

    if (ballBody.position.y < -2) {
      endSimulation(throwForce);
      return;
    }

    if (ballBody.position.y < 0.03 && ballBody.position.y >= 0) {
      let { cup, distance } = nearestCup(
        new CANNON.Vec3(ballBody.position.x, 0, ballBody.position.z)
      );
      if (cup && distance < 0.01) {
        endSimulation(throwForce, cup);
        return;
      }
    }

    if (
      ballBody.velocity.clone().normalize() <= 0.05 &&
      ballBody.position.distanceTo(new CANNON.Vec3(0, 0, 0)) > 0.03 &&
      ballBody.position.y < 0.03
    ) {
      endSimulation(throwForce);
      return;
    }

    if (simulationStartTime !== null) {
      if (time - simulationStartTime > simulationDuration) {
        endSimulation(throwForce);
        return;
      }
    }
  }
  animate();

  setInterval(() => {
    fps.value = frames;
    frames = 0;
  }, 1000);
};

function throwBall() {
  ballBody?.applyForce(
    new CANNON.Vec3(0, 0.6, mySide.value.color === 'blue' ? 0.26 : -0.26),
    ballBody.position
  );
}

function nearestCup(pos) {
  let minDistance = Infinity;
  let nearestCup = null;
  let cupPositions = otherSide.value.cups.map((cup) => {
    let position = getCupPosition(cup);
    return {
      cup: cup,
      position: new CANNON.Vec3(position.x, position.y, position.z),
    };
  });
  for (let cup of cupPositions) {
    let distance = Math.abs(pos.distanceTo(cup.position));
    if (distance < minDistance) {
      minDistance = distance;
      nearestCup = cup.cup;
    }
  }
  return {
    cup: nearestCup,
    distance: minDistance,
  };
}

let initialMousePos = { x: 0, y: 0 };
let lastMousePos = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };
let delta = { x: 0, y: 0 };
let lastTime = 0;

let throwForce = { x: 0, y: 0, z: 0 };

let simulationStartTime = null;

let arr_vel = [];

function pointerDown(e) {
  let { clientX: x, clientY: y } = e.touches?.[0] || e;
  initialMousePos = { x: x, y: y };
  lastMousePos = { x: x, y: y };
  lastTime = Date.now();
  velocity = { x: 0, y: 0 };
  delta = { x: 0, y: 0 };
}

function pointerMove(e) {
  let time = Date.now();
  let deltaTime = time - lastTime;
  if (deltaTime === 0) {
    return;
  }
  let { clientX: x, clientY: y } = e.touches?.[0] || e;
  delta = {
    x: x - lastMousePos.x,
    y: y - lastMousePos.y,
  };
  velocity = {
    x: (velocity.x + delta.x / deltaTime) / 2,
    y: (velocity.y + delta.y / deltaTime) / 2,
  };
  if (velocity.y >= 0) {
    arr_vel = [];
  }
  lastMousePos = { x: x, y: y };
  lastTime = time;
  arr_vel.unshift({ x: velocity.x, y: velocity.y });
}

function pointerUp(e) {
  if (
    replaying.value ||
    runningAction.value ||
    simulationStartTime !== null ||
    orbitControlsEnabled
  ) {
    return;
  }

  // only if it isn't right click
  if (e.button === 2) return;
  let time = Date.now();
  let sidePosNeg = mySide.value.color === 'blue' ? 1 : -1;
  let cnt = 5;

  if (arr_vel.length < cnt) return;

  let avgvel = arr_vel.slice(0, cnt).reduce(
    (acc, curr) => {
      return {
        x: acc.x + curr.x,
        y: acc.y + curr.y,
      };
    },
    {
      x: 0,
      y: 0,
    }
  );

  let angle = Math.atan2(avgvel.x, avgvel.y * -1) * -1;

  avgvel.x /= cnt;
  avgvel.y /= cnt;

  arr_vel = [];

  let force = new THREE.Vector3(
    0,
    window.yForce(avgvel.y),
    window.zForce(avgvel.y) * sidePosNeg
  );

  let yAxis = new THREE.Vector3(0, 1, 0);
  force.applyAxisAngle(yAxis, angle);

  if (force.y <= 0) {
    return;
  }
  if (ballBody?.position.distanceTo(new CANNON.Vec3(0, 0.02, 0)) <= 0.001) {
    throwForce = force;
    ballBody.applyForce(
      new CANNON.Vec3(force.x, force.y, force.z),
      ballBody.position
    );
    simulationStartTime = performance.now() / 1000;
  }
}

let actionsToReplay = [];

watch(replaying, (val) => {
  // If the replay is skipped, we need to reset the simulation
  if (!val) {
    simulationStartTime = null;
    actionsToReplay = [];
    endSimulation();
    return;
  }
});

onMounted(() => {
  window.getBaseLog = function (x, y) {
    return Math.log(y) / Math.log(x);
  };

  window.yForce = function (x) {
    return window.getBaseLog(50, x * -0.5 + 9);
  };

  window.zForce = function (x) {
    return window.getBaseLog(50, x * -0.4 + 1.5);
  };
  window.world = world;
  window.cupBodies = cupBodies;

  $replayTurn(() => {
    setTimeout(() => {
      let turn = game.value.turns[game.value.turns.length - 1];
      actionsToReplay = turn.actions;
    }, 1200);
  });

  initThree();

  let duration = 0;

  watchEffect(() => {
    gsap.to(camera.position, {
      duration: duration,
      x: cameraPosition.value.x,
      y: cameraPosition.value.y,
      z: cameraPosition.value.z,
    });

    gsap.to(camera.rotation, {
      duration: duration,
      x: cameraRotation.value.x,
      y: cameraRotation.value.y,
      z: cameraRotation.value.z,
    });

    if (orbitControls) orbitControls.update();

    duration = 1;
  });

  window.addEventListener('resize', () => {
    if (canvasWrapper.value) {
      camera.aspect =
        canvasWrapper.value.offsetWidth / canvasWrapper.value.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        canvasWrapper.value.offsetWidth,
        canvasWrapper.value.offsetHeight
      );
    }
  });
});
</script>

<template>
  <!-- GameView component, contains all basic game UI 
  like settings button-->
  <game-view :game="game" :me="me" :hint="hint">
    <!-- Game UI goes in here -->

    <div class="middle" ref="canvasWrapper">
      <!-- Game UI just for cuppong -->
      <canvas
        id="game-canvas"
        ref="canvas"
        @mousedown="pointerDown($event)"
        @mousemove="pointerMove($event)"
        @mouseup="pointerUp($event)"
        @touchstart="pointerDown($event)"
        @touchmove="pointerMove($event)"
        @touchend="pointerUp($event)"
      ></canvas>
      <!-- <p style="position: absolute; top: 16px">{{ fps }} fps</p> -->
      <div
        class="canvas-overlay"
        @animationend="overlayAnimated = false"
        :class="{ animated: overlayAnimated }"
      >
        <div class="message">{{ message }}</div>
      </div>
    </div>
  </game-view>
</template>

<style lang="scss">
.middle {
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.drag-surface {
  width: 100%;
  height: 100%;
  background: #00000033;
  position: absolute;
  display: none;
}

.canvas-overlay {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.message {
  background: #2e2e2e;
  color: #ffffff;
  border-radius: 4px;
  padding: 8px;
  font-size: 1.2em;
  font-weight: bold;
}

.canvas-overlay.animated {
  animation: fadeInOut 1s;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
