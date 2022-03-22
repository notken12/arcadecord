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

/*import Matter from 'matter-js'

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

engine.gravity.y = 0;

Render.run(Render.create({ element: canvas.value, engine }))
Runner.run(Runner.create(), engine)*/


const canvas = this.$refs.canvas;
const ctx = canvas.getContext('2d');
var width, height, dummyRadius = 30, dummies = [];

var collide = (c1, c2) => (c2.x - c1.x) ** 2 + (c2.y - c1.y) ** 2 <= (c1.r + c2.r) ** 2;

class Dummy { 
    constructor(x, y, faceDir, playerIndex, moveDir, fallen) {
        this.x = x; //x and y relative to ice size
        this.y = y;
        this.moveDir = moveDir || undefined; //vector
        this.faceDir = faceDir; //angle in degrees
        this.playerIndex = playerIndex;
        this.fallen = fallen || false;
        this.sussy = "ඞ";
    }
}
function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

for (var i = 0; i < 8; i++) {
    dummies.push( // don't want to have x or y be at the very edge of the ice
       new Dummy(randRange(10, 90), randRange(10, 90), randRange(0, 360), (i < 4) ? 1 : 0)
    );
}


function drawDummy(color, lx, ly, mobile) {
    // x and y are based on 0 - 100 relative to ice
    // radius is same for all
    ctx.beginPath()
    ctx.fillStyle = color;
    var x, y;
    if (mobile) {
      x = width / 2 - height / 4 + padding + (height / 2 - padding * 2) * lx / 100;
      y = height / 4 + padding + (height / 2 - padding * 2) * ly / 100;
    } else {
      x = width / 4 + padding + (width / 2 - padding * 2) * lx / 100;
      y = height / 2 - width / 4 + padding + (width / 2 - padding * 2) * ly / 100;
    }
    
    ctx.arc(x, y, dummyRadius, 0, 2 * Math.PI);
    ctx.fill();
    
}


function draw() {
    
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  // drawing the ice is important because the dummies' position will be relative to it
  // so we'll use the ratios of the device to know that position
  // also the ice is square
  ctx.fillStyle = 'lightBlue';
  var mobile = false; //height greater
  
    
  if (height > width) {
    // width is screen width - padding
    // height is half of screen height
    padding = height / 16
    ctx.fillRect(width / 2 - height / 4 + padding, height / 4 + padding, height / 2 - padding * 2, height / 2 - padding * 2);
    mobile = true;  
  } else {
    padding = width / 16;
    ctx.fillRect(width / 4 + padding, height / 2 - width / 4 + padding, width / 2 - padding * 2, width / 2 - padding * 2); 
  }
  dummies.forEach(dum => {
      drawDummy(dum.playerIndex ? 'blue' : 'black', dum.x, dum.y, mobile);
      dummies.forEach(compare => {
          
      });
  })
  
  requestAnimationFrame(draw);

}
document.body.appendChild(canvas);
draw();


</script>

<template>
  <canvas ref="canvas"></canvas>
</template>
