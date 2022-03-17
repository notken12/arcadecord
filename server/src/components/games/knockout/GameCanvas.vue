<script setup>
import { useFacade } from 'components/base-ui/facade'
import Common from '/gamecommons/knockout'
const {
  game,
  me,
  replaying,
  runningAction,
  $replayTurn,
  $endReplay,
  $runAction,
  $endAnimation,
} = useFacade()

import Matter from 'matter-js'

//just the boilerplate that matter js has provided for now

var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite

var engine = Engine.create()

// create two boxes and a ground


// add all of the bodies to the world
Composite.add(engine.world, [boxA, boxB, ground])

const canvas = ref(null)
engine.gravity.y = 0;

Render.run(Render.create({ element: canvas.value, engine }))
Runner.run(Runner.create(), engine)
</script>

<template>
  <canvas ref="canvas"></canvas>
</template>
