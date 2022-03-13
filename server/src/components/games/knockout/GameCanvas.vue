<script setup>
import { useFacade } from 'components/base-ui/facade'
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
var boxA = Bodies.rectangle(400, 200, 80, 80)
var boxB = Bodies.rectangle(450, 50, 80, 80)
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true })

// add all of the bodies to the world
Composite.add(engine.world, [boxA, boxB, ground])

const canvas = ref(null)

Render.run(Render.create({ element: canvas.value, engine }))
Runner.run(Runner.create(), engine)
</script>

<template>
  <canvas ref="canvas"></canvas>
</template>
